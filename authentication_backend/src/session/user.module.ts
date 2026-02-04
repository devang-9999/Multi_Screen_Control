/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { UserSession } from "./entities/user-session.entity";
import { TypeOrmModule } from "@nestjs/typeorm/dist/typeorm.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSession]),
  ]

})
export class UserModule{}