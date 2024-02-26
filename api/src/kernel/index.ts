/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import { join } from 'path';

export * from './infras';
export * from './exceptions';
export * from './common';
export * from './models';
export * from './helpers';
export * from './events';

export function getConfig(configName = 'app') {
  return require(join(__dirname, '..', 'config', configName)).default;
}
