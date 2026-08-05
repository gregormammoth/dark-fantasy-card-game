import { Body, Controller, Post } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post('events')
  ingest(@Body() body: unknown) {
    return this.analytics.ingest(body);
  }
}
