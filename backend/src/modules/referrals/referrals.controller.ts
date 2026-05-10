import { Controller, Post, Get, Param, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { ReferralsService } from './referrals.service';
import { TrackShareDto } from './dto/track-share.dto';

@ApiTags('referrals')
@Controller('api/v1/referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post('track-share')
  @ApiOperation({ summary: 'Track a resume score share and generate referral link' })
  trackShare(@Body() dto: TrackShareDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? req.socket.remoteAddress ?? 'unknown';
    const ipHash = Buffer.from(ip).toString('base64').slice(0, 20);
    return this.referralsService.trackShare(dto, ipHash);
  }

  @Get(':refToken/click')
  @ApiOperation({ summary: 'Record a referral link click' })
  recordClick(@Param('refToken') refToken: string) {
    return this.referralsService.recordClick(refToken);
  }
}
