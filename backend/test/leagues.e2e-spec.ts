import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env.test' });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { PrismaClient } from '@prisma/client';

describe('LeaguesModule (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let token: string;
  let userId: string;

  const createLeagueMutation = (name: string, isPrivate = false, avatarId?: string) => `
    mutation {
      createLeague(input: {
        name: "${name}",
        private: ${isPrivate},
        ${avatarId ? `avatarId: "${avatarId}"` : ''}
      }) {
        id
        name
        private
        sharedLink
      }
    }
  `;

  const joinLeagueMutation = (sharedLink?: string, leagueId?: string) => `
    mutation {
      joinLeague(input: {
        ${sharedLink ? `sharedLink: "${sharedLink}"` : ''}
        ${leagueId ? `leagueId: "${leagueId}"` : ''}
      }) {
        id
        name
      }
    }
  `;

  const leaveLeagueMutation = (leagueId: string) => `
    mutation {
      leaveLeague(input: {
        leagueId: "${leagueId}"
      })
    }
  `;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = new PrismaClient();

    // Nettoyage de la base de données dans le bon ordre
    await prisma.userLeague.deleteMany();
    await prisma.league.deleteMany();
    await prisma.user.deleteMany();

    // Create a user and login to get a token
    const signupResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation {
            signup(data: {
              email: "leagueuser@example.com"
              password: "StrongPass123@"
              firstname: "League"
              lastname: "Tester"
            }) {
              token
              user { id }
            }
          }
        `,
      });

    if (signupResponse.body.errors) {
      console.error('Signup error:', signupResponse.body.errors);
      throw new Error('Failed to create test user');
    }

    token = signupResponse.body.data.signup.token;
    userId = signupResponse.body.data.signup.user.id;
  });

  afterAll(async () => {
    // Nettoyage de la base de données dans le bon ordre
    await prisma.userLeague.deleteMany();
    await prisma.league.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('should create a public league', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({ query: createLeagueMutation('Public League', false) });

    expect(res.body.data.createLeague.name).toBe('Public League');
    expect(res.body.data.createLeague.private).toBe(false);
  });

  it('should create a private league', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({ query: createLeagueMutation('Private League', true) });

    expect(res.body.data.createLeague.name).toBe('Private League');
    expect(res.body.data.createLeague.private).toBe(true);
    expect(res.body.data.createLeague.sharedLink).toBeDefined();
  });

  describe('joinLeague & leaveLeague', () => {
    let sharedLink: string;
    let leagueId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({ query: createLeagueMutation('Joinable League', true) });

      if (res.body.errors) {
        console.error('Create league error:', res.body.errors);
        throw new Error('Failed to create test league');
      }

      sharedLink = res.body.data.createLeague.sharedLink;
      leagueId = res.body.data.createLeague.id;
    });

    it('should join league via sharedLink', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({ query: joinLeagueMutation(sharedLink) });

      expect(res.body.data.joinLeague.name).toBe('Joinable League');
    });

    it('should leave the league successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({ query: leaveLeagueMutation(leagueId) });

      expect(res.body.data.leaveLeague).toBe(true);
    });
  });
});
