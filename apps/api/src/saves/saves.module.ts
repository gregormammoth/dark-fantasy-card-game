import { Module } from '@nestjs/common';
import { PlayersModule } from '../players/players.module';
import { SavesController } from './saves.controller';
import { SavesService } from './saves.service';

@Module({
  imports: [PlayersModule],
  controllers: [SavesController],
  providers: [SavesService],
})
export class SavesModule {}
