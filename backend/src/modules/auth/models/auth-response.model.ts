import { ObjectType, Field } from '@nestjs/graphql';
import { UserModel } from '../../users/models/user.model';

@ObjectType()
export class AuthResponseModel {
  @Field()
  token: string;

  @Field(() => UserModel)
  user: UserModel;
}
