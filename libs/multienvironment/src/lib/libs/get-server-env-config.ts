import { getServerEnvironments } from "./get-server-environments";

export async function getServerEnvConfig({
  env,
  distFolder,
  environmentsJsonFilePath
}: { env: string; distFolder: string; environmentsJsonFilePath?: string }) {
  const environments = await getServerEnvironments(distFolder, environmentsJsonFilePath);
  return environments[env];
}
