export interface EnvironmentConfig {
  env: string;
}


const envConfigMap: Record<string, () => Promise<EnvironmentConfig>> = {
    testing: () => import('../environments/environment.testing').then(d => d.environment),
    local: () => import('../environments/environment.local').then(d => d.environment),
    dev: () => import('../environments/environment.dev').then(d => d.environment),
    pre: () => import('../environments/environment.pre').then(d => d.environment),
    pro: () => import('../environments/environment.pro').then(d => d.environment),
  };

export const getEnvironmentConfigByEnv = (env: string) => envConfigMap[env]();
