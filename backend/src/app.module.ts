import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { LeaguesModule } from './modules/leagues/leagues.module';
import { ConfigModule } from '@nestjs/config';
import { F1DataModule } from './modules/f1data/f1data.module';
import { BetSelectionModule } from './modules/bet-selection/bet-selection.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      playground: true,
      buildSchemaOptions: {
        orphanedTypes: [],
      },
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    LeaguesModule,
    F1DataModule,
    BetSelectionModule,
  ],
})
export class AppModule {}
