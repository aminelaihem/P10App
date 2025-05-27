import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { LeaguesService } from './leagues.service';
import { CreateLeagueInput } from './dto/create-league.input';
import { JoinLeagueInput } from './dto/join-league.input';
import { LeaveLeagueInput } from './dto/leave-league.input';
import { LeagueModel } from './models/league.model';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/modules/auth/guards/gql-auth.guard';

@Resolver(() => LeagueModel)
@UseGuards(GqlAuthGuard) 
export class LeaguesResolver {
  constructor(private readonly leaguesService: LeaguesService) {}

  @Mutation(() => LeagueModel)
  async createLeague(
    @Args('input') input: CreateLeagueInput,
    @Context('req') req: any,
  ) {
    return this.leaguesService.createLeague(input, req.user.userId);
  }

  @Query(() => [LeagueModel])
  async myLeagues(@Context('req') req: any) {
    return this.leaguesService.getUserLeagues(req.user.userId);
  }

  @Mutation(() => LeagueModel)
  async joinLeague(
    @Args('input') input: JoinLeagueInput,
    @Context('req') req: any,
  ) {
    return this.leaguesService.joinLeague(input, req.user.userId);
  }

  @Mutation(() => Boolean)
  async leaveLeague(
    @Args('input') input: LeaveLeagueInput,
    @Context('req') req: any,
  ) {
    await this.leaguesService.leaveLeague(input.leagueId, req.user.userId);
    return true;
  }

  @Query(() => LeagueModel)
  async mainLeague(@Context('req') req: any) {
    return this.leaguesService.addUserToMainLeague(req.user.userId);
  }
}
