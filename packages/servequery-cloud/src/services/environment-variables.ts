import * as fs from 'fs';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'path';

import { BusinessError } from '../errors';
import { EnvironmentVariables } from '../types';

const getTokenFromToolbelt = async (baseTokenPath: string): Promise<string | null> => {
  const tokenPath = path.join(baseTokenPath, '.servequery.d', '.servequeryrc');

  if (fs.existsSync(tokenPath)) return readFile(tokenPath, 'utf8');

  return null;
};

export const defaultEnvs = Object.freeze({
  SERVEQUERY_SERVER_URL: 'https://api.servequery.com',
  SERVEQUERY_SUBSCRIPTION_URL: 'wss://api.servequery.com/subscriptions',
  NODE_TLS_REJECT_UNAUTHORIZED: '1',
  TOKEN_PATH: homedir(),
});

export async function getEnvironmentVariables(): Promise<EnvironmentVariables> {
  const tokenPath = process.env.TOKEN_PATH || defaultEnvs.TOKEN_PATH;

  const SERVEQUERY_SERVER_URL =
    process.env.SERVEQUERY_SERVER_URL || process.env.SERVEQUERY_URL || defaultEnvs.SERVEQUERY_SERVER_URL;

  let SERVEQUERY_SUBSCRIPTION_URL;

  if (SERVEQUERY_SERVER_URL !== defaultEnvs.SERVEQUERY_SERVER_URL && !process.env.SERVEQUERY_SUBSCRIPTION_URL) {
    // for lumberjacks: if SERVEQUERY_SERVER_URL is not default, we can guess the subscription url
    SERVEQUERY_SUBSCRIPTION_URL = `${SERVEQUERY_SERVER_URL.replace(/^https?:\/\//, 'wss://').replace(
      /\/$/,
      '',
    )}/subscriptions`;
  } else {
    SERVEQUERY_SUBSCRIPTION_URL =
      process.env.SERVEQUERY_SUBSCRIPTION_URL || defaultEnvs.SERVEQUERY_SUBSCRIPTION_URL;
  }

  return {
    SERVEQUERY_ENV_SECRET: process.env.SERVEQUERY_ENV_SECRET,
    TOKEN_PATH: tokenPath,
    SERVEQUERY_SERVER_URL,
    SERVEQUERY_SUBSCRIPTION_URL,
    SERVEQUERY_AUTH_TOKEN: process.env.SERVEQUERY_AUTH_TOKEN || (await getTokenFromToolbelt(tokenPath)),
    NODE_TLS_REJECT_UNAUTHORIZED:
      process.env.NODE_TLS_REJECT_UNAUTHORIZED || defaultEnvs.NODE_TLS_REJECT_UNAUTHORIZED,
  };
}

function validateUrl(url: string, variableName: string, protocols: string[]): void {
  if (!url) {
    throw new BusinessError(`Missing ${variableName}. Please check your .env file.`);
  }

  let givenUrl;

  try {
    givenUrl = new URL(url);
  } catch (err) {
    throw new BusinessError(
      `${variableName} is invalid. Please check your .env file.\n${err.message}`,
    );
  }

  if (!protocols.includes(givenUrl.protocol)) {
    throw new BusinessError(
      `${variableName} is invalid, it must start with '${protocols
        .map(protocol => `${protocol}//`)
        .join("' or '")}'. Please check your .env file.`,
    );
  }
}

export function validateServerUrl(serverUrl: string): void {
  validateUrl(serverUrl, 'SERVEQUERY_SERVER_URL', ['http:', 'https:']);
}

export function validateSubscriptionUrl(subscriptionUrl: string): void {
  validateUrl(subscriptionUrl, 'SERVEQUERY_SUBSCRIPTION_URL', ['wss:']);
}

export function validateMissingServeQueryEnvSecret(
  servequeryEnvSecret: string,
  fromCommand: 'logs' | 'bootstrap',
): void {
  if (!servequeryEnvSecret) {
    throw new BusinessError(
      'Your servequery env secret is missing.' +
      ` Please provide it with the \`${fromCommand} --env-secret <your-secret-key>\` command or` +
      ' add it to your .env file or in environment variables.',
    );
  }
}

export function validateEnvironmentVariables(env: EnvironmentVariables): void {
  if (!env.SERVEQUERY_ENV_SECRET) {
    throw new BusinessError('Missing SERVEQUERY_ENV_SECRET. Please check your .env file.');
  }

  if (typeof env.SERVEQUERY_ENV_SECRET !== 'string' || !/^[0-9a-f]{64}$/.test(env.SERVEQUERY_ENV_SECRET)) {
    throw new BusinessError(
      // eslint-disable-next-line max-len
      'SERVEQUERY_ENV_SECRET is invalid. Please check your .env file.\n\tYou can retrieve its value from environment settings on Serve Query.',
    );
  }

  if (!env.SERVEQUERY_AUTH_TOKEN) {
    throw new BusinessError(
      'Missing authentication token. Your TOKEN_PATH is probably wrong on .env file.',
    );
  }

  validateServerUrl(env.SERVEQUERY_SERVER_URL);
  validateSubscriptionUrl(env.SERVEQUERY_SUBSCRIPTION_URL);
}
