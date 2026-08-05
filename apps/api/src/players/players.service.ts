import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async createGuest() {
    const id = randomUUID();
    const player = await this.prisma.player.create({
      data: { id },
    });
    return {
      playerId: player.id,
      createdAt: player.createdAt.toISOString(),
    };
  }

  async ensurePlayer(playerId: string) {
    return this.prisma.player.upsert({
      where: { id: playerId },
      create: { id: playerId },
      update: {},
    });
  }
}
