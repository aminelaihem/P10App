import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserModel } from 'src/modules/users/models/user.model';

@ObjectType()
export class LeagueModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  private: boolean;

  @Field({ nullable: true })
  sharedLink?: string;

  @Field({ nullable: true })
  avatarId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [UserModel])
  users: UserModel[];
}
