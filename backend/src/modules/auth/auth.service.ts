import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, firstname, lastname, password } = signupDto;
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Cet email est déjà utilisé.');
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.createUser({
      email,
      firstname,
      lastname,
      password: hashed,
      role: 'user',
    });
    return { id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email ou mot de passe incorrect.');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new BadRequestException('Email ou mot de passe incorrect.');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
      },
    };
  }
} 