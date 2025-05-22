import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class AvatarModel {
  @Field(() => ID)
  id: string;

  @Field()
  pictureAvatarUrl: string;
} 