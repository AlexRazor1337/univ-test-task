import { Counter } from 'prom-client';

export const deleteProductCounter = new Counter({
  name: 'products_deleted_total',
  help: 'Total number of products deleted',
});
