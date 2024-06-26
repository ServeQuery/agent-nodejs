import { exec } from 'child_process';

import { Logger } from '../types';

export default async function login(logger: Logger) {
  return new Promise<void>((resolve, reject) => {
    let hasLoginSuccess = false;
    const pathServeQuery = require.resolve('servequery-cli/bin/run');
    const subProcess = exec(`node ${pathServeQuery} login`);
    subProcess.stderr.on('data', data => {
      logger.write(data, 'stderr');
    });

    subProcess.stdout.on('data', data => {
      if (data.includes('Login successful')) hasLoginSuccess = true;
      logger.write(data, 'stdout');
    });

    subProcess.on('close', () => {
      if (!hasLoginSuccess) return reject(new Error('Login failed'));
      resolve();
    });
  });
}
