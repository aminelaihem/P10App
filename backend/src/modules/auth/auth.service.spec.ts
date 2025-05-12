import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CreateUserInput } from '../users/dto/create-user.input';
import { LoginInput } from './dto/login.input';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  const password = 'StrongPass123@';
  const hashedPassword = bcrypt.hashSync(password, 10);

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstname: 'Test',
    lastname: 'User',
    password: hashedPassword,
    role: 'user',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      createUser: jest.fn().mockResolvedValue(mockUser),
      findByEmail: jest.fn().mockResolvedValue(mockUser),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signup()', () => {
    it('should return token and user on success', async () => {
      const result = await authService.signup({
        email: mockUser.email,
        firstname: mockUser.firstname,
        lastname: mockUser.lastname,
        password,
      });

      expect(result).toEqual({ token: 'mocked-jwt-token', user: mockUser });
      expect(usersService.createUser).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      (usersService.createUser as jest.Mock).mockRejectedValue(new ConflictException('Email already exists'));

      await expect(
        authService.signup({
          email: mockUser.email,
          firstname: mockUser.firstname,
          lastname: mockUser.lastname,
          password,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      (usersService.createUser as jest.Mock).mockRejectedValue(new Error('Unexpected'));

      await expect(
        authService.signup({
          email: mockUser.email,
          firstname: mockUser.firstname,
          lastname: mockUser.lastname,
          password,
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('login()', () => {
    it('should return token and user if credentials are valid', async () => {
      const result = await authService.login({
        email: mockUser.email,
        password,
      });

      expect(result).toEqual({ token: 'mocked-jwt-token', user: mockUser });
      expect(usersService.findByEmail).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login({ email: 'unknown@example.com', password }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const userWithWrongPassword = {
        ...mockUser,
        password: bcrypt.hashSync('WrongPassword123!', 10),
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(userWithWrongPassword);

      await expect(
        authService.login({ email: mockUser.email, password }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      (usersService.findByEmail as jest.Mock).mockRejectedValue(new Error('Unexpected'));

      await expect(
        authService.login({ email: mockUser.email, password }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
