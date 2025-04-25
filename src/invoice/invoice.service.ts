import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Invoice, InvoiceDocument } from './invoice.schema';
import { Model } from 'mongoose';
import { CreateInvoiceDto } from './invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async create(obj: CreateInvoiceDto) {
    return await this.invoiceModel.create(obj);
  }

  async findAll(filters: any, options: { page: number; limit: number }) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const invoices = await this.invoiceModel
      .find(filters)
      .sort({ createdAt: -1 }) // Sort by creation date (newest first)
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.invoiceModel.countDocuments(filters).exec();

    return {
      total,
      page,
      limit,
      data: invoices.map((invoice) => invoice.toJSON()),
    };
  }

  /**
   * Retrieve a specific invoice by ID
   */
  async findOneById(id: string): Promise<InvoiceDocument | null> {
    return await this.invoiceModel.findById(id).exec();
  }
}
