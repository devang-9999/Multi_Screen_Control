/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */


import { AuthService } from './auth.service';
import { Body, Controller, Get, Post, Req,  Res,  UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.gaurd';
import { CreateAuthDto } from './dto/create-auth.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

    @Post('/register')
  registerUser(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.createUser(createAuthDto);
  }

  @Post('/login')
  @UseGuards(AuthGuard('local'))
  login(@Req() req, @Res({ passthrough: true }) res) {
    const token = this.authService.generateToken(req.user);

    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, 
      maxAge: 1 * 60 * 1000,
    });

    return { message: 'Login successful' };
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

