import { getEnvConfig } from "./get-env-config.service";
import { getEnvironments } from "./get-environments.service";
import { showActionSheet } from "../ux/show-action-sheet";

const ENVIRONMENT_STORAGE_KEY = 'OKCD_APPLICATION_ENVIRONMENT';

async function showEnvironmentOptions(environmentsJsonFilePath?: string) {
  const environments = await getEnvironments(environmentsJsonFilePath);
  const envKeys = Object.keys(environments);
  if (envKeys.length === 1) {
    const environment = envKeys[0];
    return Promise.resolve(environment);
  } else {
    const lastSelectedEnvironment = getStoredEnvironment();
    if (lastSelectedEnvironment) {
      return Promise.resolve(lastSelectedEnvironment);
    } else {
      const environment = await showActionSheet(envKeys);
      saveStoredEnvironment(environment);
      return Promise.resolve(environment);
    }
  }
}

function getStoredEnvironment() {
  return localStorage.getItem(ENVIRONMENT_STORAGE_KEY);
}

function saveStoredEnvironment(env: string) {
  localStorage.setItem(ENVIRONMENT_STORAGE_KEY, env);
}

function clearStoredEnvironment() {
  localStorage.removeItem(ENVIRONMENT_STORAGE_KEY);
}

function getBrowserEnvironment() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).okcdApplicationEnvironment;
}

function setBrowserEnvironment(env: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).okcdApplicationEnvironment = env;
}

export async function initMultiEnvironmentApp({ environmentsJsonFilePath }: { environmentsJsonFilePath?: string; }) {
  let env = getBrowserEnvironment();
  if (!env) {
    env = await showEnvironmentOptions();
    setBrowserEnvironment(env);
  }

  const envConfig = await getEnvConfig({ env, environmentsJsonFilePath });

  if (!envConfig) {
    clearStoredEnvironment();
    throw new Error(`Couldn't load browser environments`);
  }

  return { env, envConfig };
}
