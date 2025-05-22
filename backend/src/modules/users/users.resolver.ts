import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserModel } from './models/user.model';
import { CreateUserInput } from './dto/create-user.input';
import { AvatarModel } from './models/avatar.model';

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => UserModel)
  async createUser(@Args('data') data: CreateUserInput) {
    return this.usersService.createUser(data);
  }

  @Query(() => UserModel, { nullable: true })
  async userByEmail(@Args('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Query(() => UserModel, { nullable: true })
  async userById(@Args('id') id: string) {
    return this.usersService.findById(id);
  }

  @Query(() => [AvatarModel])
  async availableAvatars() {
    return this.usersService.getAvailableAvatars();
  }
} 