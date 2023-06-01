export const getEnvironmentConfigByEnv = (path: string) => {
  return import(`/src/environments/environment.${path}`)
    .then(d => d.environment)
    .catch(() => {
      // TODO
      console.log('No se encuentra el entorno');
    });
};
