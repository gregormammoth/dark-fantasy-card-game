import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: unknown) {
    if (!isRecord(body)) {
      throw new BadRequestException('Invalid player payload');
    }
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (name.length < 2 || name.length > 24) {
      throw new BadRequestException('Name must be between 2 and 24 characters');
    }
    if (body.gender !== 'man' && body.gender !== 'woman') {
      throw new BadRequestException('Gender must be man or woman');
    }
    const id = randomUUID();
    const player = await this.prisma.player.create({
      data: { id, name, gender: body.gender },
    });
    return {
      playerId: player.id,
      name: player.name,
      gender: player.gender,
      createdAt: player.createdAt.toISOString(),
    };
  }

  async ensurePlayer(playerId: string) {
    return this.prisma.player.upsert({
      where: { id: playerId },
      create: { id: playerId, name: 'Nameless', gender: 'woman' },
      update: {},
    });
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
