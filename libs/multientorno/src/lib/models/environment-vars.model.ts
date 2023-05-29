
export type Environment = typeof ENVIRONMENTS[number];
const ENVIRONMENTS = ['dev', 'pre', 'pro', 'local', 'testing'];


export interface EnvironmentVars {
  env: Environment;
}

export const isValidEnvironment = (value?: string): value is Environment =>
  ENVIRONMENTS.includes(value as Environment);

export const buildEnvVars: (envVars: Partial<EnvironmentVars>) => EnvironmentVars = ({
  env,
}) => {
  return {
    env: isValidEnvironment(env) ? env : 'testing',
  };
};

