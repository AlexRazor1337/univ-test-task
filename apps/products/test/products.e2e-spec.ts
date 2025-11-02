import { Test } from '@nestjs/testing';
import { INestApplication, Injectable } from '@nestjs/common';
import * as request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { ProductsModule } from '../src/products.module';
import { setup } from '@app/libs/api/setup';
import { ProductsRepository } from '../src/products.repository';
import { SqsEmitterService } from '@app/libs/sqs/sqs-emitter.service';

@Injectable()
class InMemoryProductsRepository {
  private items: any[] = [];
  private idCounter = 1;

  async create(dto: any) {
    const product = { ...dto, id: this.idCounter++, createdAt: new Date() };
    this.items.push(product);
    return product;
  }

  async findById(id: number) {
    return this.items.find((p) => p.id === id);
  }

  async delete(id: number) {
    const index = this.items.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }

  async getPaginated(limit: number, offset: number) {
    const items = this.items.slice(offset, offset + limit);
    return { items, total: this.items.length };
  }

  async clear() {
    this.items = [];
    this.idCounter = 1;
  }
}

const mockSqsEmitterService = {
  sendMessage: jest.fn().mockResolvedValue(undefined),
};

describe('Products API (E2E)', () => {
  let app: INestApplication;
  let repository: InMemoryProductsRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ProductsModule],
    })
      .overrideProvider(ProductsRepository)
      .useValue(new InMemoryProductsRepository())
      .overrideProvider(SqsEmitterService)
      .useValue(mockSqsEmitterService)
      .compile();

    app = moduleRef.createNestApplication();
    setup(app, false, 'Products', 'Products API');

    await app.init();
    repository = moduleRef.get(ProductsRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await repository.clear();
    jest.clearAllMocks();
  });

  it('POST /products should fail on invalid DTO', async () => {
    await request(app.getHttpServer())
      .post('/api/products')
      .send({})
      .expect(StatusCodes.BAD_REQUEST);
  });

  it('POST /products should create a product', async () => {
    const dto = { name: 'Test Product', price: '12.50' };
    const res = await request(app.getHttpServer())
      .post('/api/products')
      .send(dto)
      .expect(StatusCodes.CREATED);

    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(dto.name);
    expect(res.body.price).toBe(dto.price);

    expect(mockSqsEmitterService.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'PRODUCT_CREATED',
        product: expect.objectContaining({ id: res.body.id }),
      }),
    );
  });

  describe('Price validation', () => {
    it('should fail if price is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/products')
        .send({ name: 'No Price' })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it('should fail for invalid price strings', async () => {
      const invalidPrices = ['abc', '12.345', '12..34', '12.3.4'];

      for (const price of invalidPrices) {
        await request(app.getHttpServer())
          .post('/api/products')
          .send({ name: 'Invalid', price })
          .expect(StatusCodes.BAD_REQUEST);
      }
    });

    it('should succeed for valid price strings', async () => {
      const validPrices = ['10', '10.0', '10.00', '0.99', '12345.67'];

      for (const price of validPrices) {
        const res = await request(app.getHttpServer())
          .post('/api/products')
          .send({ name: `Product ${price}`, price })
          .expect(StatusCodes.CREATED);

        expect(res.body.price).toBe(price);
      }
    });
  });

  it('GET /products should return paginated products', async () => {
    await repository.create({ name: 'A', price: '1.00' });
    await repository.create({ name: 'B', price: '2.00' });
    await repository.create({ name: 'C', price: '3.00' });

    const res = await request(app.getHttpServer())
      .get('/api/products?limit=2&offset=0')
      .expect(StatusCodes.OK);

    expect(res.body.items.length).toBe(2);
    expect(res.body.total).toBe(3);
  });

  it('GET /products/:id should return a product', async () => {
    const product = await repository.create({
      name: 'Single Product',
      price: '5.00',
    });

    const res = await request(app.getHttpServer())
      .get(`/api/products/${product.id}`)
      .expect(StatusCodes.OK);

    expect(res.body.id).toBe(product.id);
    expect(res.body.name).toBe(product.name);
    expect(res.body.price).toBe(product.price);
  });

  it('GET /products/:id should return 404 for non-existent product', async () => {
    await request(app.getHttpServer())
      .get('/api/products/999')
      .expect(StatusCodes.NOT_FOUND);
  });

  it('DELETE /products/:id should delete a product', async () => {
    const product = await repository.create({
      name: 'To Delete',
      price: '9.99',
    });

    await request(app.getHttpServer())
      .delete(`/api/products/${product.id}`)
      .expect(StatusCodes.NO_CONTENT);

    const deleted = await repository.findById(product.id);
    expect(deleted).toBeUndefined();

    expect(mockSqsEmitterService.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'PRODUCT_DELETED',
        product: expect.objectContaining({ id: product.id }),
      }),
    );
  });

  it('DELETE /products/:id should return 404 for non-existent product', async () => {
    await request(app.getHttpServer())
      .delete('/api/products/999')
      .expect(StatusCodes.NOT_FOUND);
  });
});
