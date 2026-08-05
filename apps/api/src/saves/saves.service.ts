import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PlayersService } from '../players/players.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  isRunState,
  LOCAL_SAVE_SCHEMA_VERSION,
  supportedSchemaVersion,
} from './run-state';

@Injectable()
export class SavesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly players: PlayersService,
  ) {}

  async getLatest(playerId: string) {
    const save = await this.prisma.save.findUnique({
      where: { playerId },
    });
    if (!save) {
      throw new NotFoundException('Save not found');
    }
    return {
      playerId: save.playerId,
      schemaVersion: save.schemaVersion,
      savedAt: save.savedAt.toISOString(),
      state: save.state,
    };
  }

  async upsert(playerId: string, body: unknown) {
    if (!isRecord(body)) {
      throw new BadRequestException('Invalid save payload');
    }
    const schemaVersion =
      typeof body.schemaVersion === 'number' ? body.schemaVersion : LOCAL_SAVE_SCHEMA_VERSION;
    if (!supportedSchemaVersion(schemaVersion)) {
      throw new BadRequestException('Unsupported schemaVersion');
    }
    if (!isRunState(body.state)) {
      throw new BadRequestException('Invalid RunState');
    }
    const savedAt =
      typeof body.savedAt === 'string' && !Number.isNaN(Date.parse(body.savedAt))
        ? new Date(body.savedAt)
        : new Date();

    await this.players.ensurePlayer(playerId);

    const save = await this.prisma.save.upsert({
      where: { playerId },
      create: {
        playerId,
        schemaVersion: LOCAL_SAVE_SCHEMA_VERSION,
        state: body.state as unknown as Prisma.InputJsonValue,
        savedAt,
      },
      update: {
        schemaVersion: LOCAL_SAVE_SCHEMA_VERSION,
        state: body.state as unknown as Prisma.InputJsonValue,
        savedAt,
      },
    });

    return {
      playerId: save.playerId,
      schemaVersion: save.schemaVersion,
      savedAt: save.savedAt.toISOString(),
      state: save.state,
    };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
