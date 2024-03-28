import { ValidationError } from '@servequery/datasource-toolkit';
import { AuthenticationError } from '@servequery/servequery-client';
import Router from '@koa/router';
import jsonwebtoken from 'jsonwebtoken';
import { Context, Next } from 'koa';
import jwt from 'koa-jwt';

import { RouteType } from '../../types';
import BaseRoute from '../base-route';

export default class Authentication extends BaseRoute {
  readonly type = RouteType.Authentication;

  override async bootstrap(): Promise<void> {
    await this.options.servequeryAdminClient.authService.init();
  }

  setupRoutes(router: Router): void {
    router.post('/authentication', this.handleAuthentication.bind(this));
    router.get(
      '/authentication/callback',
      this.handleError.bind(this),
      this.handleAuthenticationCallback.bind(this),
    );

    router.use(jwt({ secret: this.options.authSecret, cookie: 'servequery_session_token' }));
  }

  private async handleAuthentication(context: Context): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = context.request.body as any;
    const renderingId = Number(body?.renderingId);
    Authentication.checkRenderingId(renderingId);

    const authorizationUrl =
      await this.options.servequeryAdminClient.authService.generateAuthorizationUrl({
        scope: 'openid email profile',
        state: JSON.stringify({ renderingId }),
      });

    context.response.body = { authorizationUrl };
  }

  private async handleAuthenticationCallback(context: Context): Promise<void> {
    // Retrieve renderingId
    const { query } = context.request;
    const state = query.state.toString();
    let renderingId: number;

    try {
      renderingId = JSON.parse(state).renderingId;
      Authentication.checkRenderingId(renderingId);
    } catch {
      throw new ValidationError('Failed to retrieve renderingId from query[state]');
    }

    // Retrieve user
    const tokenSet = await this.options.servequeryAdminClient.authService.generateTokens({
      query,
      state,
    });
    const { accessToken } = tokenSet;
    const user = await this.options.servequeryAdminClient.authService.getUserInfo(
      renderingId,
      accessToken,
    );

    // Generate final token.
    const token = jsonwebtoken.sign(user, this.options.authSecret, { expiresIn: '1 hours' });

    context.response.body = { token, tokenData: jsonwebtoken.decode(token) };
  }

  private static checkRenderingId(renderingId: number): void {
    if (Number.isNaN(renderingId)) {
      throw new ValidationError('Rendering id must be a number');
    }
  }

  private async handleError(context: Context, next: Next): Promise<void> {
    try {
      await next();
    } catch (e) {
      if (e instanceof AuthenticationError) {
        context.response.status = 401;
        context.response.body = {
          error: e.code,
          error_description: e.description,
          state: e.state,
        };

        return;
      }

      throw e;
    }
  }
}