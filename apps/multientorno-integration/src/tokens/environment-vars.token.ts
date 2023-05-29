import { InjectionToken } from '@angular/core';
import { EnvironmentVars } from '../environments/environment-vars.model';

export const ENVIRONMENT_VARS = new InjectionToken<EnvironmentVars>('ENVIRONMENT_VARS');
