import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateLeagueInput {
  @Field()
  name: string;

  @Field()
  private: boolean;

  @Field({ nullable: true })
  avatarId?: string;
}
