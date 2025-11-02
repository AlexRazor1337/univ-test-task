import { createDrizzleClient } from './db.utils';

export const dbProvider = {
  provide: 'DRIZZLE',
  useFactory: () => createDrizzleClient(),
};
