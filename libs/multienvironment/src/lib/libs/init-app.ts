import { getEnvConfig } from "./get-env-config";
import { GetEnvironmentsService } from "./get-environments";
import { showActionSheet } from "../components/show-action-sheet";

const ENVIRONMENT_STORAGE_KEY = 'OKCD_APPLICATION_ENVIRONMENT';

async function showEnvironmentOptions(environmentsJsonFilePath?: string) {
  const environments = await GetEnvironmentsService.get(environmentsJsonFilePath);
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
  return (window as any).okcdApplicationEnvironment as { env: string; config: Record<string, unknown>} | undefined;
}

function setBrowserEnvironment(env: string, config: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).okcdApplicationEnvironment = { env, config };
}

export async function initMultiEnvironmentApp({ environmentsJsonFilePath }: { environmentsJsonFilePath?: string; }) {
  const browserEnvironment = getBrowserEnvironment();

  let env = browserEnvironment?.env;
  if (!env) {
    env = await showEnvironmentOptions(environmentsJsonFilePath);
  }

  const envConfig = browserEnvironment?.config ?? await getEnvConfig(env);

  if (envConfig) {
    setBrowserEnvironment(env, envConfig);
  } else {
    clearStoredEnvironment();
    throw new Error(`Couldn't load browser environments`);
  }

  return { env, envConfig };
}
