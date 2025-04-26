import { Module } from '@nestjs/common';
import { InvoiceService, BrokerService } from './invoice.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from './invoice.schema';
import { InvoiceController } from './invoice.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService, BrokerService],
  exports: [InvoiceService],
})
export class InvoceModule {}
