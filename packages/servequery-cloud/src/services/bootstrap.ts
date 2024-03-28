import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as fsP from 'fs/promises';

import BootstrapPathManager from './bootstrap-path-manager';
import { defaultEnvs } from './environment-variables';
import HttpServer from './http-server';
import { updateTypings } from './update-typings';
import { BusinessError } from '../errors';
import { EnvironmentVariables } from '../types';

async function tryToClearBootstrap(paths: BootstrapPathManager): Promise<string | null> {
  try {
    await Promise.all([
      fsP.rm(paths.zip, { force: true }),
      fsP.rm(paths.extracted, { force: true, recursive: true }),
      fsP.rm(paths.folder, { force: false, recursive: true }),
    ]);
  } catch (e) {
    return `\nPlease remove "${paths.folderName}" folder and re-run bootstrap command.`;
  }
}

async function generateDotEnv(vars: EnvironmentVariables, paths: BootstrapPathManager) {
  const envTemplate = await fsP.readFile(paths.dotEnvTemplate, 'utf-8');
  let replaced = envTemplate.replace('<SERVEQUERY_ENV_SECRET_TO_REPLACE>', vars.SERVEQUERY_ENV_SECRET);
  replaced = replaced.replace('<TOKEN_PATH_TO_REPLACE>', paths.home);
  // For servequery developers. We store in the .env what is non default
  Object.keys(defaultEnvs)
    .filter(variableKey => vars[variableKey] && vars[variableKey] !== defaultEnvs[variableKey])
    .forEach(variableKey => {
      replaced += `\n${variableKey}=${vars[variableKey]}`;
    });

  await fsP.writeFile(paths.env, `${replaced}\n`);
}

export default async function bootstrap(
  vars: EnvironmentVariables,
  httpServer: HttpServer,
  paths: BootstrapPathManager,
): Promise<void> {
  if (fs.existsSync(paths.folder)) {
    throw new BusinessError(`You have already a "${paths.folderName}" folder`);
  }

  try {
    await HttpServer.downloadCloudCustomizerTemplate(paths.zip);

    const zip: AdmZip = new AdmZip(paths.zip);
    zip.extractAllTo(paths.tmp, false);
    await Promise.all([
      fsP.rename(paths.extracted, paths.folder),
      fsP.rm(paths.zip, { force: true }),
    ]);

    // create the .env file if it does not exist
    // we do not overwrite it because it may contain sensitive data
    if (!fs.existsSync(paths.env)) await generateDotEnv(vars, paths);
    await fsP.writeFile(paths.index, await fsP.readFile(paths.indexTemplate));

    const introspection = await httpServer.getIntrospection();

    await updateTypings(introspection, paths);
  } catch (error) {
    const potentialErrorMessage = await tryToClearBootstrap(paths);
    throw new BusinessError(`Bootstrap failed: ${error.message}.${potentialErrorMessage || ''}`);
  }
}
