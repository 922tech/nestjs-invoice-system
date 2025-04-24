import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import * as Joi from 'joi';
import config from './config';

@Module({
  imports: [
    AuthModule, UsersModule
  ],
  providers: [AppService, UsersService],
})
export class AppModule {}
