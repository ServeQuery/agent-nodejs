import {
  Aggregation,
  Caller,
  Collection,
  ConditionTreeFactory,
  Filter,
  ForbiddenError,
} from '@servequery/datasource-toolkit';
import { ServeQueryClient } from '@servequery/servequery-client';
import hashObject from 'object-hash';

import ApprovalNotAllowedError from './errors/approval-not-allowed-error';
import CustomActionRequiresApprovalError from './errors/custom-action-requires-approval-error';
import CustomActionTriggerForbiddenError from './errors/custom-action-trigger-forbidden-error';
import InvalidActionConditionError from './errors/invalid-action-condition-error';
import ConditionTreeParser from '../../../utils/condition-tree-parser';

type CanPerformCustomActionParams = {
  caller: Caller;
  customActionName: string;
  collection: Collection;
  filterForCaller: Filter; // Filter that may include scope if any
  filterForAllCaller: Filter; // Filter without scope
};

export default class ActionAuthorizationService {
  constructor(private readonly servequeryAdminClient: ServeQueryClient) { }

  public async assertCanTriggerCustomAction({
    customActionName,
    collection,
    filterForCaller,
    filterForAllCaller,
    caller,
  }: CanPerformCustomActionParams): Promise<void> {
    const canTrigger = await this.canTriggerCustomAction(
      caller,
      customActionName,
      collection,
      filterForCaller,
    );

    if (!canTrigger) {
      throw new CustomActionTriggerForbiddenError();
    }

    const triggerRequiresApproval = await this.doesTriggerCustomActionRequiresApproval(
      caller,
      customActionName,
      collection,
      filterForCaller,
    );

    if (triggerRequiresApproval) {
      const roleIdsAllowedToApprove = await this.getRoleIdsAllowedToApprove(
        caller,
        customActionName,
        collection,
        filterForAllCaller,
      );

      throw new CustomActionRequiresApprovalError(roleIdsAllowedToApprove);
    }
  }

  public async assertCanApproveCustomAction({
    customActionName,
    requesterId,
    collection,
    filterForCaller,
    filterForAllCaller,
    caller,
  }: CanPerformCustomActionParams & {
    requesterId: number | string;
  }): Promise<void> {
    const canApprove = await this.canApproveCustomAction(
      caller,
      customActionName,
      collection,
      filterForCaller,
      requesterId,
    );

    if (!canApprove) {
      const roleIdsAllowedToApprove = await this.getRoleIdsAllowedToApprove(
        caller,
        customActionName,
        collection,
        filterForAllCaller,
      );

      throw new ApprovalNotAllowedError(roleIdsAllowedToApprove);
    }
  }

  public async assertCanRequestCustomActionParameters({
    userId,
    customActionName,
    collectionName,
  }: {
    userId: number;
    customActionName: string;
    collectionName: string;
  }) {
    const canRequest =
      await this.servequeryAdminClient.permissionService.canRequestCustomActionParameters({
        userId,
        customActionName,
        collectionName,
      });

    if (!canRequest) {
      throw new ForbiddenError();
    }
  }

  private async canTriggerCustomAction(
    caller: Caller,
    customActionName: string,
    collection: Collection,
    filterForCaller: Filter,
  ): Promise<boolean> {
    const canTrigger = await this.servequeryAdminClient.permissionService.canTriggerCustomAction({
      userId: caller.id,
      customActionName,
      collectionName: collection.name,
    });

    if (!canTrigger) {
      return false;
    }

    const conditionalTriggerRawCondition =
      await this.servequeryAdminClient.permissionService.getConditionalTriggerCondition({
        userId: caller.id,
        customActionName,
        collectionName: collection.name,
      });

    return ActionAuthorizationService.canPerformConditionalCustomAction(
      caller,
      collection,
      filterForCaller,
      conditionalTriggerRawCondition,
    );
  }

  private async doesTriggerCustomActionRequiresApproval(
    caller: Caller,
    customActionName: string,
    collection: Collection,
    filterForCaller: Filter,
  ): Promise<boolean> {
    const doesTriggerRequiresApproval =
      await this.servequeryAdminClient.permissionService.doesTriggerCustomActionRequiresApproval({
        userId: caller.id,
        customActionName,
        collectionName: collection.name,
      });

    if (!doesTriggerRequiresApproval) {
      return false;
    }

    const conditionalRequiresApprovalRawCondition =
      await this.servequeryAdminClient.permissionService.getConditionalRequiresApprovalCondition({
        userId: caller.id,
        customActionName,
        collectionName: collection.name,
      });

    if (conditionalRequiresApprovalRawCondition) {
      const matchingRecordsCount =
        await ActionAuthorizationService.aggregateCountConditionIntersection(
          caller,
          collection,
          filterForCaller,
          conditionalRequiresApprovalRawCondition,
        );

      // No records match the condition, trigger does not require approval
      if (matchingRecordsCount === 0) {
        return false;
      }
    }

    return true;
  }

  private async canApproveCustomAction(
    caller: Caller,
    customActionName: string,
    collection: Collection,
    filterForCaller: Filter,
    requesterId: number | string,
  ): Promise<boolean> {
    const canApprove = await this.servequeryAdminClient.permissionService.canApproveCustomAction({
      userId: caller.id,
      requesterId,
      customActionName,
      collectionName: collection.name,
    });

    if (!canApprove) {
      return false;
    }

    const conditionalApproveRawCondition =
      await this.servequeryAdminClient.permissionService.getConditionalApproveCondition({
        userId: caller.id,
        customActionName,
        collectionName: collection.name,
      });

    return ActionAuthorizationService.canPerformConditionalCustomAction(
      caller,
      collection,
      filterForCaller,
      conditionalApproveRawCondition,
    );
  }

  private async getRoleIdsAllowedToApprove(
    caller: Caller,
    customActionName: string,
    collection: Collection,
    filterForAllCaller: Filter,
  ) {
    const actionConditionsByRoleId =
      await this.servequeryAdminClient.permissionService.getConditionalApproveConditions({
        customActionName,
        collectionName: collection.name,
      });
    const roleIdsAllowedToApproveWithoutConditions =
      await this.servequeryAdminClient.permissionService.getRoleIdsAllowedToApproveWithoutConditions({
        customActionName,
        collectionName: collection.name,
      });

    // Optimization - We groupBy conditions to only make the aggregate count once when possible
    const rolesIdsGroupByConditions =
      ActionAuthorizationService.transformToRolesIdsGroupByConditions(actionConditionsByRoleId);

    if (!rolesIdsGroupByConditions.length) {
      return roleIdsAllowedToApproveWithoutConditions;
    }

    const [requestRecordsCount, ...conditionRecordsCounts] = await Promise.all([
      ActionAuthorizationService.aggregateCountConditionIntersection(
        caller,
        collection,
        filterForAllCaller,
      ),
      ...rolesIdsGroupByConditions.map(({ condition }) =>
        ActionAuthorizationService.aggregateCountConditionIntersection(
          caller,
          collection,
          filterForAllCaller,
          condition,
        ),
      ),
    ]);

    return rolesIdsGroupByConditions.reduce(
      (roleIdsAllowedToApprove, { roleIds }, currentIndex) => {
        if (requestRecordsCount === conditionRecordsCounts[currentIndex]) {
          roleIdsAllowedToApprove.push(...roleIds);
        }

        return roleIdsAllowedToApprove;
      },
      // Roles  with userApprovalEnabled excluding the one with conditions
      // are allowed to approve by default
      roleIdsAllowedToApproveWithoutConditions,
    );
  }

  private static async canPerformConditionalCustomAction(
    caller: Caller,
    collection: Collection,
    requestFilter: Filter,
    condition?: unknown,
  ) {
    if (condition) {
      const [requestRecordsCount, matchingRecordsCount] = await Promise.all([
        ActionAuthorizationService.aggregateCountConditionIntersection(
          caller,
          collection,
          requestFilter,
        ),
        ActionAuthorizationService.aggregateCountConditionIntersection(
          caller,
          collection,
          requestFilter,
          condition,
        ),
      ]);

      // If all records condition the condition everything is ok
      // Otherwise when some records don't match the condition then the user
      // is not allow to perform the conditional action
      return matchingRecordsCount === requestRecordsCount;
    }

    return true;
  }

  private static async aggregateCountConditionIntersection(
    caller: Caller,
    collection: Collection,
    requestFilter: Filter,
    condition?: unknown,
  ) {
    try {
      // Override request filter with condition if any
      const conditionalFilter = requestFilter.override({
        conditionTree: condition
          ? ConditionTreeFactory.intersect(
            ConditionTreeParser.fromPlainObject(collection, condition),
            requestFilter.conditionTree,
          )
          : requestFilter.conditionTree,
      });

      const rows = await collection.aggregate(
        caller,
        conditionalFilter,
        new Aggregation({
          operation: 'Count',
        }),
      );

      return (rows?.[0]?.value as number) ?? 0;
    } catch (error) {
      throw new InvalidActionConditionError();
    }
  }

  /**
   * Given a map it groups keys based on their hash values
   */
  private static transformToRolesIdsGroupByConditions<T>(
    actionConditionsByRoleId: Map<number, T>,
  ): {
    roleIds: number[];
    condition: T;
  }[] {
    const rolesIdsGroupByConditions = Array.from(
      actionConditionsByRoleId,
      ([roleId, condition]) => {
        return {
          roleId,
          condition,
          conditionHash: hashObject(condition as Record<string, unknown>, { respectType: false }),
        };
      },
    ).reduce((acc, current) => {
      const { roleId, condition, conditionHash } = current;

      if (acc.has(conditionHash)) {
        acc.get(conditionHash).roleIds.push(roleId);
      } else {
        acc.set(conditionHash, { roleIds: [roleId], condition });
      }

      return acc;
    }, new Map<string, { roleIds: number[]; condition: T }>());

    return Array.from(rolesIdsGroupByConditions.values());
  }
}
