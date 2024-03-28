import { ConditionTree, ConditionTreeFactory } from '@servequery/datasource-toolkit';

export default function buildDefaultCondition(isNegated: boolean): ConditionTree {
  return isNegated ? ConditionTreeFactory.MatchAll : ConditionTreeFactory.MatchNone;
}
