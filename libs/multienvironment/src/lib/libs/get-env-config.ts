import { GetEnvironmentsService } from './get-environments';

export async function getEnvConfig(env: string) {
  const environments = await GetEnvironmentsService.get();
  return environments[env] as Record<string, unknown>;
}
