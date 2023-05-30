const path = (path: string, env: string) => { return `${path}/environment.${env}` };


const envConfigMap: Record<string, () => Promise<EnvironmentConfig>> = {
    testing: () => import(path('../environments', 'testing')).then(d => d.environment),
    local: () => import(path('../environments', 'local')).then(d => d.environment),
    dev: () => import(path('../environments', 'dev')).then(d => d.environment),
    pre: () => import(path('../environments', 'pre')).then(d => d.environment),
    pro: () => import(path('../environments', 'pro')).then(d => d.environment),
  };

export const getEnvironmentConfigByEnv = (env: string) => envConfigMap[env]();

export interface EnvironmentConfig {
  env: string
}