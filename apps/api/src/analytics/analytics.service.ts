import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async ingest(body: unknown) {
    if (!isRecord(body) || typeof body.name !== 'string' || body.name.length === 0) {
      throw new BadRequestException('Event name is required');
    }
    const playerId =
      typeof body.playerId === 'string' && body.playerId.length > 0 ? body.playerId : null;
    const payload =
      body.payload === undefined ? Prisma.JsonNull : (body.payload as Prisma.InputJsonValue);
    const event = await this.prisma.analyticsEvent.create({
      data: {
        name: body.name,
        playerId,
        payload,
      },
    });
    return {
      id: event.id,
      name: event.name,
      createdAt: event.createdAt.toISOString(),
    };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
