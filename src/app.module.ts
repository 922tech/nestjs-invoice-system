import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import config from './config';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    AuthModule, 
    MongooseModule.forRoot(config.database.url), CommonModule,
  ],
  providers: [AppService, AuthService],
})
export class AppModule {}
