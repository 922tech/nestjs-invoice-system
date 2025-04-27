import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './auth.schema';
import { MongooseErrorCodes } from '../common/common.constants';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(username: string, password: string): Promise<UserDocument> {
    try {
      const createdUser = new this.userModel({ username, password });
      return await createdUser.save();
    } catch (error) {
      if (error.code === MongooseErrorCodes.DUPLICATE_KEY) {
        throw new BadRequestException(
          'Duplicate value: username already exists.',
        );
      }
      throw error; // Re-throw other errors
    }
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOne(fields: Object): Promise<UserDocument | null> {
    return this.userModel.findOne(fields).exec();
  }
  async comparePassword(hashedPassword, plainPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  async validateUser(
    username: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.findOne({username});
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isPasswordValid = await this.comparePassword(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return user;
  }

  async updateLogin(user) {
    user.lastLogin = new Date();
    await user.save();
  }
}
