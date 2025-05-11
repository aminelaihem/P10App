import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

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
} 