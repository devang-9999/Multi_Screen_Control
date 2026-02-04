/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Auth } from './entities/auth.entity';
import { UserSession } from 'src/session/entities/user-session.entity';
import { SessionGateway } from 'src/session/session.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auth,UserSession]),
    PassportModule,
    JwtModule.register({
      secret: 'MY_SECRET_KEY',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionGateway],
  exports: [JwtModule],
})
export class AuthModule {}