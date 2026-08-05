import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(body: unknown) {
    if (!isRecord(body) || typeof body.message !== 'string' || body.message.trim().length === 0) {
      throw new BadRequestException('Feedback message is required');
    }
    const playerId =
      typeof body.playerId === 'string' && body.playerId.length > 0 ? body.playerId : null;
    const contact = typeof body.contact === 'string' ? body.contact : null;
    const row = await this.prisma.feedback.create({
      data: {
        message: body.message.trim(),
        playerId,
        contact,
      },
    });
    return {
      id: row.id,
      createdAt: row.createdAt.toISOString(),
    };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
