import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class JoinLeagueInput {
  @Field()
  sharedLink: string;
}
