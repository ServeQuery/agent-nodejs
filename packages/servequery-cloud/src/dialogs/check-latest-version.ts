import { CloudToolkitVersionError } from '../errors';
import HttpServer from '../services/http-server';
import { Spinner } from '../types';

export default async function checkLatestVersion(
  spinner: Spinner,
  customerVersion: string,
  getLatestVersion: typeof HttpServer.getLatestVersion,
): Promise<void> {
  let version: string;

  try {
    version = await getLatestVersion('@servequery/servequery-cloud');
  } catch (e) {
    spinner.info('Unable to check the latest version of @servequery/servequery-cloud');

    return;
  }

  // if major version is different
  if (version.split('.')[0] !== customerVersion.split('.')[0]) {
    throw new CloudToolkitVersionError(
      `Your version of @servequery/servequery-cloud is outdated. Latest version is ${version}.` +
      '\nPlease update it to the latest major version to be able to use our services.',
    );
  } else if (customerVersion !== version) {
    spinner.warn(
      `Your version of @servequery/servequery-cloud is outdated. Latest version is ${version}.` +
      '\nPlease update it.',
    );
  }
}
