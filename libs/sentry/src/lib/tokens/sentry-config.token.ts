import { InjectionToken } from '@angular/core';
import { SentryConfig } from '../models/sentry-config.model';

export const SENTRY_CONFIG = new InjectionToken<SentryConfig>('SENTRY_CONFIG');
