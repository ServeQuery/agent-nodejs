import superagent, { ResponseError } from 'superagent';

import { ServeQueryClientOptionsWithDefaults } from '../types';

type HttpOptions = Pick<ServeQueryClientOptionsWithDefaults, 'envSecret' | 'servequeryServerUrl'>;

export default class ServerUtils {
  /** Query Servequery-Admin server */
  static async query<T = unknown>(
    options: HttpOptions,
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    headers: Record<string, string> = {},
    body?: string | object,
    maxTimeAllowed = 10000, // Set a default value if not provided
  ): Promise<T> {
    try {
      const url = new URL(path, options.servequeryServerUrl).toString();

      const request = superagent[method](url).timeout(maxTimeAllowed);

      request.set('servequery-secret-key', options.envSecret);
      if (headers) request.set(headers);

      const response = await request.send(body);

      return response.body;
    } catch (error) {
      if (error.timeout) {
        throw new Error('The request to ServeQuery server has timeout');
      }

      this.handleResponseError(error);
    }
  }

  private static handleResponseError(e: Error): void {
    if (/certificate/i.test(e.message)) {
      throw new Error(
        'ServeQuery server TLS certificate cannot be verified. ' +
        'Please check that your system time is set properly. ' +
        `Original error: ${e.message}`,
      );
    }

    if ((e as ResponseError).response) {
      const status = (e as ResponseError)?.response?.status;
      const message = (e as ResponseError)?.response?.body?.errors?.[0]?.detail;

      // 0 == offline, 502 == bad gateway from proxy
      if (status === 0 || status === 502) {
        throw new Error('Failed to reach ServeQuery server. Are you online?');
      }

      if (status === 404) {
        throw new Error(
          'ServeQuery server failed to find the project related to the envSecret you configured.' +
          ' Can you check that you copied it properly in the Servequery initialization?',
        );
      }

      if (status === 503) {
        throw new Error(
          'Servequery is in maintenance for a few minutes. We are upgrading your experience in ' +
          'the servequery. We just need a few more minutes to get it right.',
        );
      }

      // If the server has something to say about the error, we display it.
      if (message) throw new Error(message);

      throw new Error(
        'An unexpected error occurred while contacting the ServeQuery server. ' +
        'Please contact support@servequery.com for further investigations.',
      );
    }

    throw e;
  }
}
