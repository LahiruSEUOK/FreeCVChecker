import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from './entities/referral.entity';
import { TrackShareDto } from './dto/track-share.dto';

export interface ShareResult {
  message: string;
  refToken: string;
  shareUrl: string;
  shareText: string;
}

@Injectable()
export class ReferralsService {
  private readonly logger = new Logger(ReferralsService.name);

  constructor(
    @InjectRepository(Referral)
    private readonly referralRepo: Repository<Referral>,
  ) {}

  async trackShare(dto: TrackShareDto, ipHash: string): Promise<{ message: string; data: ShareResult }> {
    try {
      const refToken = this._generateToken();
      const frontendUrl = process.env.FRONTEND_URL ?? 'https://freshercv.io';
      const shareUrl = `${frontendUrl}?ref=${refToken}`;

      const referral = this.referralRepo.create({
        referrerHash: ipHash,
        platform: dto.sharePlatform,
        scoreShared: dto.score,
        refToken,
      });
      await this.referralRepo.save(referral);

      const roleText = dto.role ? ` for ${dto.role}` : '';
      const shareText = `I just scored ${dto.score}/100 on ATS compatibility${roleText}! Check if your resume passes ATS screening for free 👉 ${shareUrl}`;

      this.logger.log(JSON.stringify({ action: 'SHARE_TRACKED', platform: dto.sharePlatform, score: dto.score }));

      return {
        message: 'Share tracked successfully',
        data: { message: shareText, refToken, shareUrl, shareText },
      };
    } catch (err) {
      this.logger.error('trackShare failed', err instanceof Error ? err.stack : err);
      throw err;
    }
  }

  async recordClick(refToken: string): Promise<{ message: string; data: { redirectUrl: string } }> {
    const referral = await this._findByToken(refToken);
    if (!referral) throw new NotFoundException('Referral link not found');

    await this.referralRepo.increment({ id: referral.id }, 'clickCount', 1);
    const frontendUrl = process.env.FRONTEND_URL ?? 'https://freshercv.io';
    return { message: 'Click recorded', data: { redirectUrl: `${frontendUrl}?ref=${refToken}` } };
  }

  private async _findByToken(token: string): Promise<Referral | null> {
    try {
      return await this.referralRepo.findOne({ where: { refToken: token } });
    } catch (err) {
      this.logger.warn('_findByToken failed', err instanceof Error ? err.message : err);
      return null;
    }
  }

  private _generateToken(): string {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  }
}
