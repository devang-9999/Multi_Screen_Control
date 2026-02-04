/* eslint-disable prettier/prettier */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid } from 'uuid';
import { UserSession } from 'src/session/entities/user-session.entity';
import { SessionGateway } from 'src/session/session.gateway';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(Auth)
    private authRepo: Repository<Auth>,

    @InjectRepository(UserSession)
    private sessionRepo: Repository<UserSession>,

    private jwtService: JwtService,
    private sessionGateway: SessionGateway,
  ) { }

  async signup(data: CreateAuthDto) {

    const user = this.authRepo.create({
      username: data.username,
      useremail: data.useremail,
      userPassword: data.userPassword,
    });

    return this.authRepo.save(user);
  }

  async login(data: LoginAuthDto) {

    const user = await this.authRepo.findOne({
      where: {
        useremail: data.email,
        userPassword: data.password
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const activeSessions = await this.sessionRepo.find({
      where: {
        userId: user.userid,
        isActive: true,
      },
    });

    if (activeSessions.length < 2) {
      return this.createSession(user);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Promise.all(
      activeSessions.map(session => {
        session.otp = otp;
        return this.sessionRepo.save(session);
      }),
    );

    this.sessionGateway.sendOtpToOldSessions(
      activeSessions.map(s => s.sessionId),
      otp,
    );

    return {
      message: 'Maximum sessions reached. OTP required.',
      otpRequired: true,
      userId: user.userid,
    };
  }

  async verifyOtp(userId: number, otp: string) {

    const sessions = await this.sessionRepo.find({
      where: {
        userId,
        isActive: true,
      },
    });

    if (sessions.length === 0)
      throw new UnauthorizedException('No active sessions');

    if (sessions[0].otp !== otp)
      throw new UnauthorizedException('Invalid OTP');

    await Promise.all(
      sessions.map(s => {
        s.isActive = false;
        s.otp = null;
        return this.sessionRepo.save(s);
      }),
    );

    this.sessionGateway.forceLogout(
      sessions.map(s => s.sessionId),
    );

    const user = await this.authRepo.findOne({
      where: { userid: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.createSession(user);

  }

  async createSession(user: Auth) {

    const sessionId = uuid();

    const payload = {
      userId: user.userid,
      sessionId,
    };

    const token = this.jwtService.sign(payload);

    const session = this.sessionRepo.create({
      userId: user.userid,
      sessionId,
    });

    await this.sessionRepo.save(session);

    return {
      token,
      sessionId,
    };
  }
}
