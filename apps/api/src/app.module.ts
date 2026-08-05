import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { PlayersModule } from './players/players.module';
import { SavesModule } from './saves/saves.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    PlayersModule,
    SavesModule,
    AnalyticsModule,
    FeedbackModule,
  ],
})
export class AppModule {}
