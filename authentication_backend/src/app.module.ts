/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/datasource/data_source';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './session/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({...dataSourceOptions}),
    AuthModule,UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}