import { Controller, Post, Get, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { TrackImpressionDto } from './dto/track-impression.dto';

@ApiTags('analytics')
@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track-ad-impression')
  @ApiOperation({ summary: 'Track an ad impression or click' })
  trackImpression(@Body() dto: TrackImpressionDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? req.socket.remoteAddress ?? 'unknown';
    const userIdentifier = Buffer.from(ip).toString('base64').slice(0, 20);
    return this.analyticsService.trackImpression(dto, userIdentifier);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Internal analytics dashboard data' })
  getDashboard() {
    return this.analyticsService.getDashboard();
  }
}
