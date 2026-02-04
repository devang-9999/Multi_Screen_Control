/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { VerifyOtpDto } from './dto/verify-opt.dto';

@Controller('auth/')
export class AuthController {

  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: CreateAuthDto) {
    return this.authService.signup(body);
  }

  @Post('login')
  login(@Body() body: LoginAuthDto) {
    return this.authService.login(body);
  }

  @Post('verify-otp')
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body.userId, body.otp);
  }
}
