import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsOptional } from 'class-validator';

@InputType()
export class CreateBetInput {
  @Field()
  @IsUUID()
  gpId: string;

  @Field()
  @IsUUID()
  leagueId: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  piloteP10Id?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  piloteDNFId?: string;
}