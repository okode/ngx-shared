import { InjectionToken } from '@angular/core';
import { EnvironmentConfig } from '../models/environment-config.model';

export const ENVIRONMENT_CONFIG = new InjectionToken<EnvironmentConfig>('ENVIRONMENT_CONFIG');
