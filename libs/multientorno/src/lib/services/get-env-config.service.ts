import { getEnvironments } from "./get-environments.service";

export async function getEnvConfig({
  env,
  fallbackEnv,
  environmentsJsonFilePath
}: { env: string; fallbackEnv?: string; environmentsJsonFilePath?: string }) {
  const environments = await getEnvironments(environmentsJsonFilePath);
  return environments[env] ?? (fallbackEnv ? environments[fallbackEnv] : null);
}
