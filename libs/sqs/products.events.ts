export enum ProductEvents {
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_DELETED = 'PRODUCT_DELETED',
}

export type ProductEvent = {
  event: ProductEvents;
  product: any;
};
