import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env.test' });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { PrismaClient } from '@prisma/client';

describe('AuthModule (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = new PrismaClient();
    await prisma.user.deleteMany(); // clean
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  const signupMutation = (email: string, password: string, firstname = 'Test', lastname = 'User') => `
    mutation {
      signup(data: {
        email: "${email}"
        password: "${password}"
        firstname: "${firstname}"
        lastname: "${lastname}"
      }) {
        token
        user {
          email
          firstname
        }
      }
    }
  `;

  const loginMutation = (email: string, password: string) => `
    mutation {
      login(data: {
        email: "${email}"
        password: "${password}"
      }) {
        token
        user {
          email
        }
      }
    }
  `;

  describe('Signup', () => {
    it('should signup successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: signupMutation('e2e@example.com', 'StrongPass123@') });

      expect(res.body.data.signup.user.email).toBe('e2e@example.com');
      expect(res.body.data.signup.token).toBeDefined();
    });

    it('should fail if email already exists', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: signupMutation('e2e@example.com', 'StrongPass123@') });

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toBe("Cet email est déjà utilisé.");
    });

    it('should fail with invalid email format', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: signupMutation('notanemail', 'StrongPass123@') });

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toMatch(/email/i); // message exact selon class-validator
    });

    it('should fail with weak password', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: signupMutation('weakpass@example.com', '123') });

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toBe(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
      );
    });

    it('should fail if email is missing', async () => {
      const badMutation = `
        mutation {
          signup(data: {
            password: "StrongPass123@"
            firstname: "Missing"
            lastname: "Email"
          }) {
            token
            user {
              email
            }
          }
        }
      `;

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: badMutation });

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toMatch(/email/i);
    });
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: loginMutation('e2e@example.com', 'StrongPass123@') });

      expect(res.body.data.login.user.email).toBe('e2e@example.com');
      expect(res.body.data.login.token).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: loginMutation('e2e@example.com', 'WrongPass') });

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toBe("Email ou mot de passe incorrect");
    });

    it('should fail with unknown email', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: loginMutation('unknown@example.com', 'StrongPass123@') });

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toBe("Email ou mot de passe incorrect");
    });

    it('should fail if email is missing', async () => {
      const badLogin = `
        mutation {
          login(data: {
            password: "StrongPass123@"
          }) {
            token
            user {
              email
            }
          }
        }
      `;

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: badLogin });

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toMatch(/email/i);
    });
  });
});
