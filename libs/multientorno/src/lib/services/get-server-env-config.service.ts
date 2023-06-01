import { getServerEnvironments } from "./get-server-environments.service";

export async function getServerEnvConfig({
  env,
  distFolder,
  fallbackEnv,
  environmentsJsonFilePath
}: { env: string; distFolder: string; fallbackEnv?: string; environmentsJsonFilePath?: string }) {
  const environments = await getServerEnvironments(distFolder, environmentsJsonFilePath);
  return environments[env] ?? (fallbackEnv ? environments[fallbackEnv] : null);
}
