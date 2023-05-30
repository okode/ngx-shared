import { InjectionToken } from '@angular/core';
import { EnvironmentConfig } from '../config/environment-config';

//TODO sí que tiene que ser de tipo unknown
export const ENVIRONMENT_CONFIG = new InjectionToken<unknown>('ENVIRONMENT_CONFIG');
