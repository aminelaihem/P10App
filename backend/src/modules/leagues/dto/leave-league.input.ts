import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LeaveLeagueInput {
  @Field()
  leagueId: string;
}
