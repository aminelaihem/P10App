import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class JoinLeagueInput {
  @Field({ nullable: true })
  sharedLink?: string;

  @Field({ nullable: true })
  leagueId?: string;
}
