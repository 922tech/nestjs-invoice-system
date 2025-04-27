import { Body, Controller, Get, Param, Post, Query, NotFoundException } from '@nestjs/common';
import { InvoiceService, BrokerService } from './invoice.service';
import { CreateInvoiceDto } from './invoice.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('invoices')
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}


  @Post('/')
  async create(@Body() body: CreateInvoiceDto) {
    const invoice = await this.invoiceService.create(body);
    return invoice.toJSON();
  }

  
  @Get('/')
  @ApiQuery({ name: 'page', required: true, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: true, description: 'Number of records per page', example: 10 })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for filtering invoices (YYYY-MM-DD)', example: '2025-04-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for filtering invoices (YYYY-MM-DD)', example: '2025-04-25' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = {};
    if (startDate) {
      filters['createdAt'] = { $gte: new Date(startDate) };
    }
    if (endDate) {
      filters['createdAt'] = { ...filters['createdAt'], $lte: new Date(endDate) };
    }

    const invoices = await this.invoiceService.findAll(
      filters,
      { page, limit },
    );
    return invoices;
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    const invoice = await this.invoiceService.findOneById(id);
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found.`);
    }
    return invoice.toJSON();
  }
}