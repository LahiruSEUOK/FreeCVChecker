import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdImpression } from './entities/ad-impression.entity';
import { TrackImpressionDto } from './dto/track-impression.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(AdImpression)
    private readonly adRepo: Repository<AdImpression>,
  ) {}

  async trackImpression(
    dto: TrackImpressionDto,
    userIdentifier: string,
  ): Promise<{ message: string; data: { tracked: boolean } }> {
    try {
      const impression = this.adRepo.create({
        userIdentifier,
        adUnit: dto.adUnit,
        position: dto.position,
        clicked: dto.clicked ?? false,
      });
      await this.adRepo.save(impression);
      return { message: 'Impression tracked', data: { tracked: true } };
    } catch (err) {
      this.logger.warn('trackImpression failed', err instanceof Error ? err.message : err);
      return { message: 'Impression tracked', data: { tracked: false } };
    }
  }

  async getDashboard(): Promise<{ message: string; data: Record<string, unknown> }> {
    try {
      const totalImpressions = await this.adRepo.count();
      const totalClicks = await this.adRepo.count({ where: { clicked: true } });
      const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

      return {
        message: 'Dashboard data fetched successfully',
        data: { totalImpressions, totalClicks, ctr: `${ctr}%`, estimatedRevenue: '0.0000' },
      };
    } catch (err) {
      this.logger.error('getDashboard failed', err instanceof Error ? err.stack : err);
      throw err;
    }
  }
}
