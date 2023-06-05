export const DEFAULT_ENVIRONMENT_JSON_FILE_PATH = '/assets/environments.json';

export async function getEnvironments(environmentsJsonFilePath?: string) {
  return fetch(environmentsJsonFilePath ?? DEFAULT_ENVIRONMENT_JSON_FILE_PATH)
    .then(res => res.json())
    .then(environments => environments as Record<string, unknown>)
    .then(environments => {
      if (!environments || !Object.keys(environments).length) {
        return Promise.reject('No environments provided');
      }
      return environments;
    });
}
