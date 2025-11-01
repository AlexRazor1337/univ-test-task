import { Counter } from 'prom-client';

export const createProductCounter = new Counter({
  name: 'products_created_total',
  help: 'Total number of products created',
});
