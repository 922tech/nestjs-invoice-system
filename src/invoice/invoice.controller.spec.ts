import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { NotFoundException } from '@nestjs/common';

describe('InvoiceController', () => {
  let controller: InvoiceController;
  let service: InvoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController],
      providers: [
        {
          provide: InvoiceService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOneById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InvoiceController>(InvoiceController);
    service = module.get<InvoiceService>(InvoiceService);
  });

  describe('create', () => {
    it('should create a new invoice and return it', async () => {
      const mockInvoice = { id: '1', customer: 'John Doe', amount: 100, items: [{ sku: 'ITEM-001', qt: 2 }] };
      jest.spyOn(service, 'create').mockResolvedValue(mockInvoice as any);

      const result = await controller.create({
        customer: 'John Doe',
        amount: 100,
        reference: 'INV-001',
        items: [{ sku: 'ITEM-001', qt: 2 }],
      });

      expect(service.create).toHaveBeenCalledWith({
        customer: 'John Doe',
        amount: 100,
        reference: 'INV-001',
        items: [{ sku: 'ITEM-001', qt: 2 }],
      });
      console.log(result,'---------<');
      // expect(result).t(mockInvoice);
    });
  });

  describe('findAll', () => {
    it('should return a list of invoices with pagination', async () => {
      const mockInvoices = {
        total: 2,
        page: 1,
        limit: 10,
        data: [
          { id: '1', customer: 'John Doe', amount: 100 },
          { id: '2', customer: 'Jane Doe', amount: 200 },
        ],
      };
      jest.spyOn(service, 'findAll').mockResolvedValue(mockInvoices);

      const result = await controller.findAll(1, 10);

      expect(service.findAll).toHaveBeenCalledWith({}, { page: 1, limit: 10 });
      expect(result).toEqual(mockInvoices);
    });

    it('should apply date filters when provided', async () => {
      const mockInvoices = {
        total: 1,
        page: 1,
        limit: 10,
        data: [{ id: '1', customer: 'John Doe', amount: 100 }],
      };
      jest.spyOn(service, 'findAll').mockResolvedValue(mockInvoices);

      const startDate = '2025-04-01';
      const endDate = '2025-04-25';
      const result = await controller.findAll(1, 10, startDate, endDate);

      expect(service.findAll).toHaveBeenCalledWith(
        {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
        { page: 1, limit: 10 },
      );
      expect(result).toEqual(mockInvoices);
    });
  });

  describe('findOne', () => {
    it('should return a specific invoice by ID', async () => {
      const mockInvoice = { id: '1', customer: 'John Doe', amount: 100 };
      jest.spyOn(service, 'findOneById').mockResolvedValue(mockInvoice as any);

      const result = await controller.findOne('1');

      expect(service.findOneById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockInvoice);
    });

    it('should throw NotFoundException if invoice is not found', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue(null);

      await expect(controller.findOne('1')).rejects.toThrow(
        new NotFoundException('Invoice with ID 1 not found.'),
      );
    });
  });
});