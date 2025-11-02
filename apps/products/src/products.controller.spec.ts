import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PaginatedProductsDto } from './dto/paginated-products.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: jest.Mocked<ProductsService>;

  const mockProduct = { id: 1, name: 'Product A' } as any;
  const mockPaginated: PaginatedProductsDto = {
    items: [mockProduct],
    total: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            create: jest.fn(),
            getAllPaginated: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(ProductsController);
    service = module.get(ProductsService);
  });

  describe('create', () => {
    it('should delegate creation to service', async () => {
      service.create.mockResolvedValue(mockProduct);

      const dto = { name: 'Product A' } as any;
      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('getAll', () => {
    it('should return paginated products', async () => {
      service.getAllPaginated.mockResolvedValue(mockPaginated);

      const result = await controller.getAll({ limit: 10, offset: 0 });

      expect(service.getAllPaginated).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });
      expect(result).toEqual(mockPaginated);
    });
  });

  describe('findOne', () => {
    it('should return one product', async () => {
      service.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProduct);
    });

    it('should propagate NotFoundException', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete product via service', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });
});
