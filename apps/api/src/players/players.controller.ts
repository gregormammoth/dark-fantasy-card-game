import { Body, Controller, Post } from '@nestjs/common';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly players: PlayersService) {}

  @Post()
  create(@Body() body: unknown) {
    return this.players.create(body);
  }
}
