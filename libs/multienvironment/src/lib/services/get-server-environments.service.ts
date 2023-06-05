import { readFileSync } from "fs";
import { DEFAULT_ENVIRONMENT_JSON_FILE_PATH } from "./get-environments.service";

export async function getServerEnvironments(distPath: string, environmentsJsonFilePath?: string) {
  const environmentsPath = environmentsJsonFilePath ?? DEFAULT_ENVIRONMENT_JSON_FILE_PATH;
  const content = readFileSync(`${distPath}${environmentsPath}`, { encoding: 'utf8' });
  const environments = JSON.parse(content);
  if (!environments || !Object.keys(environments).length) {
    return Promise.reject('No environments provided');
  }
  return environments;
}
