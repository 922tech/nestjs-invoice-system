import { Module } from '@nestjs/common';
import { InvoiceService, BrokerService, CronService } from './invoice.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from './invoice.schema';
import { InvoiceController } from './invoice.controller';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    ScheduleModule.forRoot()
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService, BrokerService, CronService],
  exports: [InvoiceService],
})
export class InvoceModule {}
