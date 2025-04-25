import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import config from './config';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { InvoceModule } from './invoice/invoice.module';
import { InvoiceController } from './invoice/invoice.controller';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot(config.database.url),
    CommonModule,
    InvoceModule,
  ],
  providers: [AppService, AuthService],
  controllers: [InvoiceController],
})
export class AppModule {}
