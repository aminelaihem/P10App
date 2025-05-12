import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from '../users/dto/create-user.input';
import { LoginInput } from './dto/login.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(data: CreateUserInput) {
    const user = await this.usersService.createUser(data);
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { token, user };
  }

  async login(data: LoginInput) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const passwordValid = await bcrypt.compare(data.password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { token, user };
  }
}
