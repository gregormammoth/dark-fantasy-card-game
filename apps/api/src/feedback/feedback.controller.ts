import { Body, Controller, Post } from '@nestjs/common';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedback: FeedbackService) {}

  @Post()
  submit(@Body() body: unknown) {
    return this.feedback.submit(body);
  }
}
