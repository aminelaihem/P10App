import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  async findByEmail(email: string) {
    // TODO: Intégrer Prisma
    return null;
  }

  async createUser(data: any) {
    // TODO: Intégrer Prisma
    return null;
  }
} 