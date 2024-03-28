import * as fs from 'fs';
import * as fsPromises from 'node:fs/promises';
import { homedir } from 'node:os';

import {
  getEnvironmentVariables,
  validateEnvironmentVariables,
  validateServerUrl,
  validateSubscriptionUrl,
} from '../../src/services/environment-variables';

jest.mock('node:fs/promises');
jest.mock('fs');

describe('environment-variables', () => {
  beforeEach(() => {
    jest.spyOn(fsPromises, 'readFile').mockResolvedValue('the-token-from-file');
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.clearAllMocks();
  });

  describe('getEnvironmentVariables', () => {
    describe('if all vars are provided by env', () => {
      it('should provide the variables if present', async () => {
        process.env.SERVEQUERY_ENV_SECRET = 'abc';
        process.env.SERVEQUERY_SERVER_URL = 'https://the.servequery.server.url';
        process.env.SERVEQUERY_AUTH_TOKEN = 'tokenAbc123';
        process.env.SERVEQUERY_SUBSCRIPTION_URL = 'wss://the.servequery.subs.url';
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
        expect(await getEnvironmentVariables()).toEqual({
          SERVEQUERY_AUTH_TOKEN: 'tokenAbc123',
          SERVEQUERY_ENV_SECRET: 'abc',
          SERVEQUERY_SERVER_URL: 'https://the.servequery.server.url',
          SERVEQUERY_SUBSCRIPTION_URL: 'wss://the.servequery.subs.url',
          NODE_TLS_REJECT_UNAUTHORIZED: '1',
          TOKEN_PATH: homedir(),
        });
      });

      it('should accept SERVEQUERY_URL as alternative to SERVEQUERY_SERVER_URL', async () => {
        process.env.SERVEQUERY_ENV_SECRET = 'abc';
        process.env.SERVEQUERY_URL = 'https://the.servequery.server.url';
        delete process.env.SERVEQUERY_SERVER_URL;
        process.env.SERVEQUERY_AUTH_TOKEN = 'tokenAbc123';
        process.env.SERVEQUERY_SUBSCRIPTION_URL = 'wss://the.servequery.subs.url';
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
        expect(await getEnvironmentVariables()).toEqual({
          SERVEQUERY_AUTH_TOKEN: 'tokenAbc123',
          SERVEQUERY_ENV_SECRET: 'abc',
          SERVEQUERY_SERVER_URL: 'https://the.servequery.server.url',
          SERVEQUERY_SUBSCRIPTION_URL: 'wss://the.servequery.subs.url',
          NODE_TLS_REJECT_UNAUTHORIZED: '1',
          TOKEN_PATH: homedir(),
        });
      });
    });

    describe(`if SERVEQUERY_SERVER_URL is different from
    default and SERVEQUERY_SUBSCRIPTION_URL is not provided`, () => {
      it.each([
        ['https://my-super-url.co'],
        ['http://my-super-url.co'],
        ['https://my-super-url.co/'],
        ['http://my-super-url.co/'],
      ])(
        'from SERVEQUERY_SERVER_URL=%s it should build SERVEQUERY_SUBSCRIPTION_URL=%s',
        async SERVEQUERY_SERVER_URL => {
          process.env.SERVEQUERY_SERVER_URL = SERVEQUERY_SERVER_URL;
          process.env.SERVEQUERY_SUBSCRIPTION_URL = '';
          expect(await getEnvironmentVariables()).toMatchObject({
            SERVEQUERY_SUBSCRIPTION_URL: 'wss://my-super-url.co/subscriptions',
          });
        },
      );
    });

    describe('if SERVEQUERY_AUTH_TOKEN is missing', () => {
      it('should retrieve from file at TOKEN_PATH', async () => {
        process.env.SERVEQUERY_AUTH_TOKEN = '';
        process.env.TOKEN_PATH = '/my/token/path';
        const b = await getEnvironmentVariables();
        expect(b).toMatchObject({
          SERVEQUERY_AUTH_TOKEN: 'the-token-from-file',
        });
        expect(fsPromises.readFile).toHaveBeenCalledTimes(1);
        expect(fsPromises.readFile).toHaveBeenCalledWith(
          '/my/token/path/.servequery.d/.servequeryrc',
          'utf8',
        );
      });

      describe('If there is no .servequeryrc', () => {
        it('should return SERVEQUERY_AUTH_TOKEN as null', async () => {
          // no .servequeryrc
          jest.spyOn(fs, 'existsSync').mockReturnValue(false);

          const b = await getEnvironmentVariables();
          expect(b).toMatchObject({ SERVEQUERY_AUTH_TOKEN: null });
        });
      });

      it('should retrieve from homedir file if TOKEN_PATH missing', async () => {
        process.env.SERVEQUERY_AUTH_TOKEN = '';
        process.env.TOKEN_PATH = '';
        expect(await getEnvironmentVariables()).toMatchObject({
          SERVEQUERY_AUTH_TOKEN: 'the-token-from-file',
          TOKEN_PATH: homedir(),
        });
        expect(fsPromises.readFile).toHaveBeenCalledTimes(1);
        expect(fsPromises.readFile).toHaveBeenCalledWith(
          `${homedir()}/.servequery.d/.servequeryrc`,
          'utf8',
        );
      });
    });

    describe('if SERVEQUERY_SERVER_URL and SERVEQUERY_SUBSCRIPTION_URL are missing', () => {
      it('should use sane default', async () => {
        process.env.SERVEQUERY_SERVER_URL = '';
        process.env.SERVEQUERY_URL = '';
        process.env.SERVEQUERY_SUBSCRIPTION_URL = '';
        expect(await getEnvironmentVariables()).toMatchObject({
          SERVEQUERY_SERVER_URL: 'https://api.servequery.com',
          SERVEQUERY_SUBSCRIPTION_URL: 'wss://api.servequery.com/subscriptions',
        });
      });
    });

    describe('validateServerUrl', () => {
      describe('if the url is valid', () => {
        it('should not throw', () => {
          expect(() => validateServerUrl('https://test.com')).not.toThrow();
        });
      });

      describe('if no server url is provided', () => {
        it('should throw a specific error', () => {
          expect(() => validateServerUrl(undefined as unknown as string)).toThrow(
            'Missing SERVEQUERY_SERVER_URL. Please check your .env file.',
          );
        });
      });

      describe('if the string is not an url', () => {
        it('should throw a specific error', () => {
          expect(() => validateServerUrl('toto')).toThrow(
            `SERVEQUERY_SERVER_URL is invalid. Please check your .env file.\nInvalid URL`,
          );
        });
      });

      describe('if the protocol is wrong', () => {
        it('should throw a specific error', () => {
          expect(() => validateServerUrl('httpx://toto')).toThrow(
            `SERVEQUERY_SERVER_URL is invalid, it must start with 'http://' or 'https://'. Please check your .env file.`,
          );
        });
      });
    });

    describe('validateSubscription', () => {
      describe('if the url is valid', () => {
        it('should not throw', () => {
          expect(() => validateSubscriptionUrl('wss://test.com')).not.toThrow();
        });
      });

      describe('if no subscription url is provided', () => {
        it('should throw a specific error', () => {
          expect(() => validateSubscriptionUrl(undefined as unknown as string)).toThrow(
            'Missing SERVEQUERY_SUBSCRIPTION_URL. Please check your .env file.',
          );
        });
      });

      describe('if the string is not an url', () => {
        it('should throw a specific error', () => {
          expect(() => validateSubscriptionUrl('toto')).toThrow(
            `SERVEQUERY_SUBSCRIPTION_URL is invalid. Please check your .env file.\nInvalid URL`,
          );
        });
      });

      describe('if the protocol is wrong', () => {
        it('should throw a specific error', () => {
          expect(() => validateSubscriptionUrl('httpx://toto')).toThrow(
            `SERVEQUERY_SUBSCRIPTION_URL is invalid, it must start with 'wss://'. Please check your .env file.`,
          );
        });
      });
    });

    describe('validateEnvironmentVariables', () => {
      describe('if the SERVEQUERY_ENV_SECRET is missing', () => {
        test('it should throw a specific error', () => {
          expect(() =>
            validateEnvironmentVariables({
              SERVEQUERY_ENV_SECRET: '',
              SERVEQUERY_SERVER_URL: '',
              SERVEQUERY_SUBSCRIPTION_URL: '',
              SERVEQUERY_AUTH_TOKEN: '',
              NODE_TLS_REJECT_UNAUTHORIZED: '',
              TOKEN_PATH: '',
            }),
          ).toThrow('Missing SERVEQUERY_ENV_SECRET. Please check your .env file.');
        });
      });

      describe('if the SERVEQUERY_ENV_SECRET is a wrong format', () => {
        test('it should throw a specific error', () => {
          expect(() =>
            validateEnvironmentVariables({
              SERVEQUERY_ENV_SECRET: 'wrong-format',
              SERVEQUERY_SERVER_URL: '',
              SERVEQUERY_SUBSCRIPTION_URL: '',
              SERVEQUERY_AUTH_TOKEN: '',
              NODE_TLS_REJECT_UNAUTHORIZED: '',
              TOKEN_PATH: '',
            }),
          ).toThrow(
            // eslint-disable-next-line max-len
            'SERVEQUERY_ENV_SECRET is invalid. Please check your .env file.\n\tYou can retrieve its value from environment settings on Serve Query.',
          );
        });
      });

      describe('if the SERVEQUERY_ENV_SECRET is not a string', () => {
        test('it should throw a specific error', () => {
          expect(() =>
            validateEnvironmentVariables({
              SERVEQUERY_ENV_SECRET: 123 as unknown as string,
              SERVEQUERY_SERVER_URL: '',
              SERVEQUERY_SUBSCRIPTION_URL: '',
              SERVEQUERY_AUTH_TOKEN: '',
              NODE_TLS_REJECT_UNAUTHORIZED: '',
              TOKEN_PATH: '',
            }),
          ).toThrow(
            // eslint-disable-next-line max-len
            'SERVEQUERY_ENV_SECRET is invalid. Please check your .env file.\n\tYou can retrieve its value from environment settings on Serve Query.',
          );
        });
      });

      describe('if the SERVEQUERY_AUTH_TOKEN is missing', () => {
        test('it should throw a specific error', () => {
          expect(() =>
            validateEnvironmentVariables({
              SERVEQUERY_ENV_SECRET: 'a'.repeat(64),
              SERVEQUERY_SERVER_URL: '',
              SERVEQUERY_SUBSCRIPTION_URL: '',
              SERVEQUERY_AUTH_TOKEN: '',
              NODE_TLS_REJECT_UNAUTHORIZED: '',
              TOKEN_PATH: '',
            }),
          ).toThrow(
            'Missing authentication token. Your TOKEN_PATH is probably wrong on .env file.',
          );
        });
      });

      describe('if SERVEQUERY_SERVER_URL is missing', () => {
        test('it should delegate to validateServerUrl', () => {
          expect(() =>
            validateEnvironmentVariables({
              SERVEQUERY_ENV_SECRET: 'a'.repeat(64),
              SERVEQUERY_SERVER_URL: '',
              SERVEQUERY_SUBSCRIPTION_URL: '',
              SERVEQUERY_AUTH_TOKEN: 'a'.repeat(64),
              NODE_TLS_REJECT_UNAUTHORIZED: '',
              TOKEN_PATH: '',
            }),
          ).toThrow('Missing SERVEQUERY_SERVER_URL. Please check your .env file.');
        });
      });

      describe('if everything is correctly set', () => {
        test('it should not throw', () => {
          expect(() =>
            validateEnvironmentVariables({
              SERVEQUERY_ENV_SECRET: 'a'.repeat(64),
              SERVEQUERY_SERVER_URL: 'http://test.com',
              SERVEQUERY_SUBSCRIPTION_URL: 'wss://test.com',
              SERVEQUERY_AUTH_TOKEN: 'a'.repeat(64),
              NODE_TLS_REJECT_UNAUTHORIZED: '',
              TOKEN_PATH: '',
            }),
          ).not.toThrow();
        });
      });
    });
  });
});
