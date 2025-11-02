import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';
import { SqsEmitterService } from '@app/libs/sqs/sqs-emitter.service';
import { ProductEvents } from '@app/libs/sqs/products.events';
import { NotFoundException } from '@nestjs/common';
import { createProductCounter } from './metrics/create-product.counter';
import { deleteProductCounter } from './metrics/delete-product.counter';

describe('ProductsService', () => {
  let service: ProductsService;
  let repo: jest.Mocked<ProductsRepository>;
  let sqs: jest.Mocked<SqsEmitterService>;

  const mockProduct = { id: 1, name: 'Test Product' } as any;
  const mockPaginated = {
    items: [mockProduct],
    total: 1,
    limit: 10,
    offset: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: {
            create: jest.fn(),
            getPaginated: jest.fn(),
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: SqsEmitterService,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ProductsService);
    repo = module.get(ProductsRepository);
    sqs = module.get(SqsEmitterService);

    jest.spyOn(createProductCounter, 'inc').mockImplementation(jest.fn());
    jest.spyOn(deleteProductCounter, 'inc').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product, increment counter, and send SQS event', async () => {
      repo.create.mockResolvedValue(mockProduct);

      const dto = { name: 'Test Product' } as any;
      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(createProductCounter.inc).toHaveBeenCalledTimes(1);
      expect(sqs.sendMessage).toHaveBeenCalledWith({
        event: ProductEvents.PRODUCT_CREATED,
        product: { id: mockProduct.id, name: mockProduct.name },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw if SQS sendMessage fails after creation', async () => {
      repo.create.mockResolvedValue(mockProduct);
      sqs.sendMessage.mockRejectedValue(new Error('SQS down'));

      await expect(
        service.create({ name: 'Broken Event' } as any),
      ).rejects.toThrow('SQS down');

      expect(createProductCounter.inc).toHaveBeenCalled();
    });
  });

  describe('getAllPaginated', () => {
    it('should return paginated products', async () => {
      repo.getPaginated.mockResolvedValue(mockPaginated);

      const result = await service.getAllPaginated({ limit: 10, offset: 0 });

      expect(repo.getPaginated).toHaveBeenCalledWith(10, 0);
      expect(result).toEqual(mockPaginated);
    });

    it('should apply default pagination values when none provided', async () => {
      repo.getPaginated.mockResolvedValue(mockPaginated);

      await service.getAllPaginated({} as any);

      expect(repo.getPaginated).toHaveBeenCalledWith(10, 0);
    });
  });

  describe('findOne', () => {
    it('should return a product if found', async () => {
      repo.findById.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);

      expect(repo.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(repo.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('delete', () => {
    it('should delete product, increment counter, and send SQS event', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      repo.delete.mockResolvedValue(undefined);

      await service.delete(1);

      expect(repo.delete).toHaveBeenCalledWith(1);
      expect(deleteProductCounter.inc).toHaveBeenCalledTimes(1);
      expect(sqs.sendMessage).toHaveBeenCalledWith({
        event: ProductEvents.PRODUCT_DELETED,
        product: { id: mockProduct.id, name: mockProduct.name },
      });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.delete(123)).rejects.toThrow(NotFoundException);
      expect(repo.delete).not.toHaveBeenCalled();
      expect(deleteProductCounter.inc).not.toHaveBeenCalled();
    });

    it('should propagate repository errors during deletion', async () => {
      repo.findById.mockResolvedValue(mockProduct);
      const error = new Error('Delete failed');
      repo.delete.mockRejectedValue(error);

      await expect(service.delete(1)).rejects.toThrow(error);

      expect(deleteProductCounter.inc).not.toHaveBeenCalled();
      expect(sqs.sendMessage).not.toHaveBeenCalled();
    });
  });
});
