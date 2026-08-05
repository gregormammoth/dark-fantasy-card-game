import { Body, Controller, Get, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { SavesService } from './saves.service';

@Controller('saves')
export class SavesController {
  constructor(private readonly saves: SavesService) {}

  @Get(':playerId')
  getLatest(@Param('playerId', ParseUUIDPipe) playerId: string) {
    return this.saves.getLatest(playerId);
  }

  @Put(':playerId')
  upsert(
    @Param('playerId', ParseUUIDPipe) playerId: string,
    @Body() body: unknown,
  ) {
    return this.saves.upsert(playerId, body);
  }
}
