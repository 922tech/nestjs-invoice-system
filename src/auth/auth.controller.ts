import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  Get,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import config from '../config';
import { User, UserDocument } from './auth.schema';
import { AuthGuard } from '@nestjs/passport';

enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    if (user) {
      user.lastLogin = new Date();
      await this.authService.updateLogin(user);
      return this.issueTokens(user);
    }
  }

  private issueTokens(user: UserDocument) {
    const userData = { id: user._id };
    return {
      access_token: this.jwtService.sign({
        ...userData,
        type: TokenType.ACCESS,
      }),
      refresh_token: this.jwtService.sign(
        { ...userData, type: TokenType.REFRESH },
        { expiresIn: config.jwt.refreshExpiresIn },
      ),
    };
  }

  @Post('signup')
  async signup(@Body() body: LoginDto) {
    const user = await this.authService.create(body.username, body.password);
    return this.issueTokens(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req) {
    console.log(req.user);
    return this.authService.findOne({_id: req.user.id});
  }
}
