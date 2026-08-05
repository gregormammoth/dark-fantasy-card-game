import { Controller, Post } from '@nestjs/common';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly players: PlayersService) {}

  @Post()
  createGuest() {
    return this.players.createGuest();
  }
}
