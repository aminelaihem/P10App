import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from './dto/create-user.input';

@Injectable()
export class UsersService {
  private prisma = new PrismaClient();

  async createUser(data: CreateUserInput): Promise<User> {
    const email = data.email.trim().toLowerCase();

    // Vérifier le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Email invalide.');
    }

    // Vérifier unicité email
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé.');
    }

    // Vérifier que firstname et lastname ne sont pas vides
    if (!data.firstname?.trim()) {
      throw new BadRequestException('Le prénom est requis.');
    }
    if (!data.lastname?.trim()) {
      throw new BadRequestException('Le nom est requis.');
    }

    // Vérifier la complexité du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;
    if (!data.password || data.password.length < 8 || !passwordRegex.test(data.password)) {
      throw new BadRequestException(
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
      );
    }

    const hashed = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        email,
        firstname: data.firstname.trim(),
        lastname: data.lastname.trim(),
        password: hashed,
        role: 'user', // ou data.role si besoin
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
