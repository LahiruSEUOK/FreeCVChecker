import {
  Injectable, Logger, NotFoundException, InternalServerErrorException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import Groq from 'groq-sdk';
import { AiRewrite } from './entities/ai-rewrite.entity';
import { GenerateRewriteDto } from './dto/generate-rewrite.dto';

export const AI_REWRITE_QUEUE = 'ai_rewrite';

export interface RewriteResult {
  original: string;
  rewrites: string[];
  rewriteId: string;
}

@Injectable()
export class AiRewriteService {
  private readonly logger = new Logger(AiRewriteService.name);
  private readonly groq: Groq;

  constructor(
    @InjectQueue(AI_REWRITE_QUEUE) private readonly rewriteQueue: Queue,
    @InjectRepository(AiRewrite) private readonly rewriteRepo: Repository<AiRewrite>,
  ) {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async generateRewrites(dto: GenerateRewriteDto): Promise<{ message: string; data: RewriteResult }> {
    try {
      const rewrites = await this._callGroq(dto.bulletPoint, dto.jobDescription);

      const entity = this.rewriteRepo.create({
        resumeId: dto.resumeId,
        originalBullet: dto.bulletPoint,
        rewrites,
      });
      const saved = await this.rewriteRepo.save(entity);

      this.logger.log(JSON.stringify({ action: 'REWRITES_GENERATED', resumeId: dto.resumeId, rewriteId: saved.id }));

      return {
        message: 'Rewrites generated successfully',
        data: { original: dto.bulletPoint, rewrites, rewriteId: saved.id },
      };
    } catch (err) {
      this.logger.error('generateRewrites failed', err instanceof Error ? err.stack : err);
      const fallback = this._fallbackRewrites(dto.bulletPoint);
      return {
        message: 'Rewrites generated (fallback mode)',
        data: { original: dto.bulletPoint, rewrites: fallback, rewriteId: '' },
      };
    }
  }

  async selectRewrite(rewriteId: string, selected: string): Promise<{ message: string; data: { updated: boolean } }> {
    try {
      const entity = await this.rewriteRepo.findOne({ where: { id: rewriteId } });
      if (!entity) throw new NotFoundException('Rewrite record not found');
      entity.selectedRewrite = selected;
      await this.rewriteRepo.save(entity);
      return { message: 'Selection saved', data: { updated: true } };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error('selectRewrite failed', err instanceof Error ? err.stack : err);
      throw new InternalServerErrorException('Failed to save selection');
    }
  }

  private async _callGroq(bullet: string, jobDesc: string): Promise<string[]> {
    const prompt = `You are an expert resume writer specialising in ATS-optimised resumes for fresh graduates.

Job Description (extract key skills from this):
${jobDesc.slice(0, 2000)}

Original bullet point to rewrite:
"${bullet}"

Generate exactly 3 improved versions that:
1. Naturally incorporate relevant keywords from the job description
2. Start with a strong action verb (Led, Built, Designed, Implemented, Achieved, etc.)
3. Include quantifiable results where possible (%, numbers, scale)
4. Are concise (under 20 words each)
5. Sound authentic for a fresh graduate

Respond with ONLY a JSON array of 3 strings, no other text:
["rewrite 1", "rewrite 2", "rewrite 3"]`;

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = completion.choices[0]?.message?.content ?? '';
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return this._fallbackRewrites(bullet);

    const parsed: unknown = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return this._fallbackRewrites(bullet);
    return (parsed as string[]).slice(0, 3).map((s) => String(s));
  }

  private _fallbackRewrites(bullet: string): string[] {
    const base = bullet.trim();
    return [
      `Developed and implemented ${base.toLowerCase()} to drive measurable results`,
      `Led cross-functional efforts to ${base.toLowerCase()}, improving team efficiency`,
      `Designed and delivered ${base.toLowerCase()}, achieving key project milestones`,
    ];
  }
}
