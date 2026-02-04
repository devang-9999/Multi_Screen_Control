/* eslint-disable prettier/prettier */
import { HttpException,  } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Auth } from './entities/auth.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid } from 'uuid';
import { UserSession } from 'src/session/entities/user-session.entity';


@Injectable()
export class AuthService {
  verifyToken: any;

  constructor(
    @InjectRepository(Auth)
    readonly userRepository: Repository<Auth>,
    @InjectRepository(UserSession)
    readonly sessionRepo: Repository<UserSession>,

    readonly jwtService: JwtService,

  ) { }

  async createUser(createAuthDto: CreateAuthDto) {
    const { username, useremail, userPassword } = createAuthDto;
    const existingUser = await this.userRepository.findOne({
      where: [{ useremail }],
    });
    if (existingUser) {
      throw new HttpException({ message: 'User already exists' }, 400);
    }
    const newUser = this.userRepository.create({
      username,
      useremail,
      userPassword,
    });
    return this.userRepository.save(newUser);
  }

  async validateUser(email: string, password: string) {
    const currentUser = await this.userRepository.findOne({
      where: { useremail: email, userPassword: password },
    });
    if (currentUser?.noOfLogin === 2) {
      throw new HttpException({ message: 'User is blocked due to multiple invalid login attempts' }, 403);
    }

    else if (currentUser?.noOfLogin === 1) {
      currentUser.noOfLogin = 2;
      await this.userRepository.save(currentUser);
    }

    else if (currentUser?.noOfLogin === 0) {
      currentUser.noOfLogin = 1;
      await this.userRepository.save(currentUser);
    }

    else {
      return "User not found";
    }

    return currentUser;

  }

  generateToken(user: Auth) {
    return this.jwtService.sign({
      userid: user.userid,
      email: user.useremail,
    });
  }

  async activeSessions(userId: number) {
    return await this.sessionRepo.count({
      where: { userId, isActive: true },
    });
  }

  async createSession(userId: number) {
    const sessionId = uuid();

    await this.sessionRepo.save({
      userId,
      sessionId,
      isActive: true,
    });

    return this.jwtService.sign({ userId, sessionId });
  }

  async invalidateAllSessions(userId: number) {
    await this.sessionRepo.update(
      { userId },
      { isActive: false },
    );
  }

  async isSessionValid(userId: number, sessionId: string) {
    return this.sessionRepo.findOne({
      where: { userId, sessionId, isActive: true },
    });
  }
}