import * as ngCore from '@angular/core';
import * as ngCommon from '@angular/common';

const platformSpy = jest.spyOn(ngCommon, 'isPlatformServer');
platformSpy.mockReturnValue(true);

export const mockDevMode = (value: boolean) => {
  return jest.spyOn(ngCore, 'isDevMode').mockReturnValue(value);
};

export const mockPlatform = (value: 'server' | 'browser') => {
  jest.spyOn(ngCommon, 'isPlatformServer').mockReturnValue(value === 'server');
  jest.spyOn(ngCommon, 'isPlatformBrowser').mockReturnValue(value === 'browser');
};
