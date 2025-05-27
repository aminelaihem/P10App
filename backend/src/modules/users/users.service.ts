import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from './dto/create-user.input';
import { User } from '@prisma/client';
import { AvatarModel } from './models/avatar.model';
import { LeaguesService } from '../leagues/leagues.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly leaguesService: LeaguesService
  ) {}

  async createUser(data: CreateUserInput): Promise<User> {
    const email = data.email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Email invalide.');
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé.');
    }

    if (!data.firstname?.trim()) {
      throw new BadRequestException('Le prénom est requis.');
    }
    if (!data.lastname?.trim()) {
      throw new BadRequestException('Le nom est requis.');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;
    if (!data.password || data.password.length < 8 || !passwordRegex.test(data.password)) {
      throw new BadRequestException(
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
      );
    }

    const hashed = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        firstname: data.firstname.trim(),
        lastname: data.lastname.trim(),
        password: hashed,
        avatarId: data.avatarId,
        role: 'user',
      },
    });

    // Ajouter automatiquement l'utilisateur à la ligue principale
    await this.leaguesService.addUserToMainLeague(user.id);

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getAvailableAvatars(): Promise<AvatarModel[]> {
    return this.prisma.avatar.findMany();
  }
}
