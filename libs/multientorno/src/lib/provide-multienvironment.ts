import { StaticProvider } from '@angular/core';
import { ENVIRONMENT_CONFIG } from './token/environment-config.token';
import { ENVIRONMENT_NAME } from './token/environment-name.token';

export function provideMultienvironmentConfig(envName: string, envConfig: unknown): StaticProvider[] {
  return [
    { provide: ENVIRONMENT_NAME, useValue: envName },
    { provide: ENVIRONMENT_CONFIG, useValue: envConfig },
  ];
}
