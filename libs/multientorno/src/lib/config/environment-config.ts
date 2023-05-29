import { Environment } from '../models/environment-vars.model';

// const envConfigMap: Record<Environment, () => Promise<EnvironmentConfig>> = {
//     testing: () => import('../environments/environment.testing').then(d => d.environment),
//     local: () => import('../environments/environment.local').then(d => d.environment),
//     dev: () => import('../environments/environment.dev').then(d => d.environment),
//     pre: () => import('../environments/environment.pre').then(d => d.environment),
//     pro: () => import('../environments/environment.pro').then(d => d.environment),
//   };

// export const getEnvironmentConfigByEnv = (env: Environment) => envConfigMap[env]();
