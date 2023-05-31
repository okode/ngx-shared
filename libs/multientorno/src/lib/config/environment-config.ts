export const getEnvironmentConfigByEnv = (env: string) => {
  return import(`/src/environments/environment.${env}`)
    .then(d => d.environment)
    .catch(() => {
      console.log('No se encuentra el entorno');
    });
};
