import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateLeagueInput {
  @Field()
  name: string;

  @Field({ defaultValue: false })
  private: boolean;
}
