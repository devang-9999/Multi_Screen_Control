/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Auth {
  @PrimaryGeneratedColumn()
  userid: number;

  @Column()
  username: string;

  @Column({ unique: true })
  useremail: string;

  @Column()
  userPassword: string;

  @Column({ default: 0 })
  noOfLogin:number

}