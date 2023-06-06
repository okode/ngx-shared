import { getServerEnvConfig } from "./get-server-env-config";

export async function initServerMultiEnvironmentApp({
  envVar,
  defaultEnv,
  distFolder,
  environmentsJsonFilePath
}: { envVar: string; defaultEnv?: string; distFolder: string; environmentsJsonFilePath?: string }) {
  const env = process.env[envVar] ?? defaultEnv;
  if (!env) {
    throw new Error(`Couldn't load server environment`);
  }

  const envConfig = await getServerEnvConfig({ env, distFolder, environmentsJsonFilePath });
  if (!envConfig) {
    throw new Error(`Couldn't load server environment config`);
  }

  return { env, envConfig };
}
