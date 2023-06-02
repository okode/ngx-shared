import { getEnvConfig } from "./get-env-config.service";
import { getEnvironments } from "./get-environments.service";
import { addStyles, buttonStyles, divStyles } from "../styles/styles";

const ENVIRONMENT_STORAGE_KEY = 'OKCD_APPLICATION_ENVIRONMENT';

async function showEnvironmentOptions(environmentsJsonFilePath?: string) {
  const environments = await getEnvironments(environmentsJsonFilePath);
  const envKeys = Object.keys(environments);
  if (envKeys.length === 1) {
    const environment = environments[envKeys[0]];
    return Promise.resolve(environment);
  } else {
    const environment = await showActionSheet(envKeys);
    return Promise.resolve(environment);
  }
}

async function showActionSheet(options: string[]) {
  return new Promise(resolve => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    addStyles(div, divStyles);
    const selectOption = (option: string) => {
      resolve(option);
      div.remove();
    };
    options.forEach((env: string) => {
      const buttonElement = document.createElement('button');
      buttonElement.innerText = `${env}`;
      addStyles(buttonElement, buttonStyles);
      buttonElement.addEventListener('click', () => selectOption(env));
      div.appendChild(buttonElement);
    });
  })
}

function getBrowserEnvironment() {
  return (window as any).okcdApplicationEnvironment || localStorage.getItem(ENVIRONMENT_STORAGE_KEY);
}

function saveBrowserEnvironment(env: string) {
  (window as any).okcdApplicationEnvironment = env;
  localStorage.setItem(ENVIRONMENT_STORAGE_KEY, env);
}

function clearBrowserEnvironment() {
  delete (window as any).okcdApplicationEnvironment;
  localStorage.removeItem(ENVIRONMENT_STORAGE_KEY);
}

export async function initMultiEnvironmentApp({ environmentsJsonFilePath }: { environmentsJsonFilePath?: string; }) {
  let env = getBrowserEnvironment();
  if (!env) {
    env = await showEnvironmentOptions();
    saveBrowserEnvironment(env);
  }

  const envConfig = await getEnvConfig({ env, environmentsJsonFilePath });

  if (!envConfig) {
    clearBrowserEnvironment();
    throw new Error(`Couldn't load browser environments`);
  }

  return { env, envConfig };
}
