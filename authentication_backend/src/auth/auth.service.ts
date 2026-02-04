/* eslint-disable prettier/prettier */
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Auth } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private userRepository: Repository<Auth>,
    private jwtService: JwtService,
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

    const currentUser= await this.userRepository.findOne({
      where: { useremail: email, userPassword: password },
    });

    if(currentUser?.noOfLogin===2){
      throw new HttpException({ message: 'User is blocked due to multiple invalid login attempts' }, 403);
  }else if(currentUser?.noOfLogin===1){
      currentUser.noOfLogin+=1;
      await this.userRepository.save(currentUser);
  }else if(currentUser?.noOfLogin===0){
    currentUser.noOfLogin+=1;
    await this.userRepository.save(currentUser);
  }else{
    return "User not found";
  }
}

  generateToken(user: Auth) {
    return this.jwtService.sign({
      userid: user.userid,
      email: user.useremail,
    });

    
  }
}