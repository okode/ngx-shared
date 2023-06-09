import { DEFAULT_ENVIRONMENT_JSON_FILE_PATH } from '../constants/environments.constants';

export class GetEnvironmentsService {
  private static environmentsDataMap = new Map<string, Record<string, unknown>>();

  static async get(environmentsJsonFilePath?: string) {
    const envsJsonFilePath = environmentsJsonFilePath ?? DEFAULT_ENVIRONMENT_JSON_FILE_PATH;
    const environmentsData = this.environmentsDataMap.get(envsJsonFilePath);
    if (environmentsData) {
      return Promise.resolve(environmentsData);
    }
    return fetch(envsJsonFilePath)
      .then(res => res.json())
      .then(environments => environments as Record<string, unknown>)
      .then(environments => {
        if (!environments || !Object.keys(environments).length) {
          return Promise.reject('No environments provided');
        }
        this.environmentsDataMap.set(envsJsonFilePath, environments);
        return environments;
      });
  }
}
