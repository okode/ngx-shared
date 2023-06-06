import { getEnvironments } from "./get-environments.service";

export async function getEnvConfig({
  env,
  environmentsJsonFilePath
}: { env: string; environmentsJsonFilePath?: string }): Promise<Record<string, unknown> | undefined> {
  const environments = await getEnvironments(environmentsJsonFilePath);
  return environments[env] as Record<string, unknown>;
}
