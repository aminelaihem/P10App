import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponseModel } from './models/auth-response.model';
import { LoginInput } from './dto/login.input';
import { CreateUserInput } from '../users/dto/create-user.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponseModel)
  async signup(@Args('data') data: CreateUserInput) {
    return this.authService.signup(data);
  }

  @Mutation(() => AuthResponseModel)
  async login(@Args('data') data: LoginInput) {
    return this.authService.login(data);
  }
}
