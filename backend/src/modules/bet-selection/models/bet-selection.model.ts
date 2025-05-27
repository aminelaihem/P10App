import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class BetSelectionResultModel {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  gpId: string;

  @Field(() => String)
  leagueId: string;

  @Field(() => String, { nullable: true })
  piloteP10Id?: string;

  @Field(() => String, { nullable: true })
  piloteDNFId?: string;

  @Field({ nullable: true })
  pointsP10?: number;

  @Field({ nullable: true })
  pointsDNF?: number;
}