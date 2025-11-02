import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ProductsModule } from '../src/products.module';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ProductsModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('/products (POST) should fail validation', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .send({}) // missing required fields
      .expect(400); // Bad Request
  });

  it('/products (POST) should create product', async () => {
    const dto = { name: 'New Product' };
    const res = await request(app.getHttpServer())
      .post('/products')
      .send(dto)
      .expect(201);

    expect(res.body.name).toBe(dto.name);
    expect(res.body.id).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
