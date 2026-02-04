/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */

import { AuthService } from './auth.service';
import { Body, Controller, Get, Post, Req,  Res,  UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.gaurd';
import { CreateAuthDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  registerUser(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.createUser(createAuthDto);
  }

    @Post('login')
    async login(@Body() body, @Res({ passthrough: true }) res) {
        const { userId } = body;
        const count = await this.authService.activeSessions(userId);
        if (count >= 2) {
            return { otpRequired: true };
        }

        const token = await this.authService.createSession(userId);

        res.cookie('access_token', token, {
            httpOnly: true,
            maxAge: 5 * 60 * 1000,
        });

        return { success: true };
    }

    @Post('verify-otp')
    async verifyOtp(@Body() body, @Res({ passthrough: true }) res) {
        const { userId, otp } = body;

        if (otp !== '123456') {
            return { error: 'Invalid OTP' };
        }

        await this.authService.invalidateAllSessions(userId);

        const token = await this.authService.createSession(userId);

        res.cookie('access_token', token, {
            httpOnly: true,
            maxAge: 5 * 60 * 1000,
        });

        return { success: true };
    }

  @Post('/logout')
  logout(@Res({ passthrough: true }) res) {
    res.clearCookie('access_token');
    return { message: 'Logged out' };
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return req.user;
  }
}

