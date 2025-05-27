// src/modules/bet-selection/dto/update-bet.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsOptional } from 'class-validator';

@InputType()
export class UpdateBetInput {
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