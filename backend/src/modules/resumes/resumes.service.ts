import {
  Injectable, Logger, BadRequestException,
  NotFoundException, InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import sanitizeHtml from 'sanitize-html';
import { Resume, ParsedResumeData } from './entities/resume.entity';
import { ResumeScore, ScoreBreakdown, Recommendation } from './entities/resume-score.entity';

export interface ScoreResult {
  scoreId: string;
  score: number;
  breakdown: ScoreBreakdown;
  missingKeywords: string[];
  recommendations: Recommendation[];
}

const TECH_SKILLS = [
  'python','java','javascript','typescript','react','angular','vue','node','nestjs',
  'spring','docker','kubernetes','aws','gcp','azure','sql','postgresql','mongodb',
  'redis','graphql','git','html','css','tailwind','machine learning','tensorflow',
];

@Injectable()
export class ResumesService {
  private readonly logger = new Logger(ResumesService.name);

  constructor(
    @InjectRepository(Resume) private readonly resumeRepo: Repository<Resume>,
    @InjectRepository(ResumeScore) private readonly scoreRepo: Repository<ResumeScore>,
  ) {}

  async uploadAndParse(
    file: Express.Multer.File,
    userIdentifier: string | null,
  ): Promise<{ message: string; data: { resumeId: string; parsedData: ParsedResumeData } }> {
    try {
      if (!file) throw new BadRequestException('Resume file is required');

      const allowedMimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedMimes.includes(file.mimetype)) {
        throw new BadRequestException('Only PDF, DOCX, and TXT files are supported');
      }
      if (file.size > 5 * 1024 * 1024) throw new BadRequestException('File size must be under 5MB');

      const rawText = await this._extractText(file);
      if (!rawText || rawText.trim().length < 50) {
        throw new BadRequestException('Could not extract readable text from the uploaded file');
      }

      const sanitised = sanitizeHtml(rawText, { allowedTags: [], allowedAttributes: {} });
      const parsedData = this._parseResumeText(sanitised);

      const resume = this.resumeRepo.create({
        userIdentifier,
        resumeText: sanitised.slice(0, 50000),
        parsedData,
        fileFormat: file.originalname.split('.').pop()?.toLowerCase() ?? 'unknown',
      });
      const saved = await this.resumeRepo.save(resume);

      this.logger.log(JSON.stringify({ action: 'RESUME_UPLOADED', resumeId: saved.id, skillCount: parsedData.skills.length }));

      return { message: 'Resume parsed successfully', data: { resumeId: saved.id, parsedData } };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error('uploadAndParse failed', err instanceof Error ? err.stack : err);
      throw new InternalServerErrorException('Failed to process resume');
    }
  }

  async scoreResume(
    resumeId: string,
    jobDescription: string,
  ): Promise<{ message: string; data: ScoreResult }> {
    try {
      const resume = await this._findResumeById(resumeId);
      if (!resume) throw new NotFoundException('Resume not found');

      const cleanJob = sanitizeHtml(jobDescription, { allowedTags: [], allowedAttributes: {} });
      const breakdown = this._calculateBreakdown(resume, cleanJob);
      const score = Math.round(
        breakdown.formatting * 0.1 +
        breakdown.keywords * 0.4 +
        breakdown.structure * 0.2 +
        breakdown.content * 0.3,
      );

      const missingKeywords = this._findMissingKeywords(resume.resumeText, cleanJob);
      const recommendations = this._buildRecommendations(missingKeywords, resume.parsedData);

      const scoreEntity = this.scoreRepo.create({
        resumeId,
        jobDescription: cleanJob.slice(0, 10000),
        score,
        breakdown,
        missingKeywords,
        recommendations,
      });
      const saved = await this.scoreRepo.save(scoreEntity);

      this.logger.log(JSON.stringify({ action: 'RESUME_SCORED', resumeId, score, missingCount: missingKeywords.length }));

      return {
        message: 'Resume scored successfully',
        data: { scoreId: saved.id, score, breakdown, missingKeywords, recommendations },
      };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error('scoreResume failed', err instanceof Error ? err.stack : err);
      throw new InternalServerErrorException('Failed to score resume');
    }
  }

  private async _extractText(file: Express.Multer.File): Promise<string | null> {
    try {
      if (file.mimetype === 'text/plain') return file.buffer.toString('utf-8');
      // For PDF/DOCX, use raw buffer text extraction as fallback
      // In production integrate pdf-parse / mammoth
      return file.buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    } catch (err) {
      this.logger.warn('_extractText failed', err instanceof Error ? err.message : err);
      return null;
    }
  }

  private _parseResumeText(text: string): ParsedResumeData {
    const lower = text.toLowerCase();

    const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
    const phoneMatch = text.match(/[\+]?[\d\s\-().]{7,}/);
    const nameMatch = text.split('\n').find((l) => l.trim().length > 2 && l.trim().length < 60 && /^[A-Z]/.test(l.trim()));

    const skills = TECH_SKILLS.filter((s) => lower.includes(s));

    const expSection = this._extractSection(text, ['experience', 'work history', 'employment']);
    const eduSection = this._extractSection(text, ['education', 'academic']);

    return {
      name: nameMatch?.trim() ?? undefined,
      email: emailMatch?.[0] ?? undefined,
      phone: phoneMatch?.[0]?.trim() ?? undefined,
      skills,
      experience: expSection ? [{ title: 'See experience section', company: '', duration: '', bullets: expSection.split('\n').filter(Boolean).slice(0, 5) }] : [],
      education: eduSection ? [{ degree: eduSection.split('\n')[0] ?? '', institution: '', year: '' }] : [],
      projects: [],
      summary: text.split('\n').slice(0, 5).join(' ').slice(0, 300),
    };
  }

  private _extractSection(text: string, headers: string[]): string | null {
    const lower = text.toLowerCase();
    for (const h of headers) {
      const idx = lower.indexOf(h);
      if (idx !== -1) return text.slice(idx, idx + 800);
    }
    return null;
  }

  private _calculateBreakdown(resume: Resume, jobDesc: string): ScoreBreakdown {
    const text = resume.resumeText.toLowerCase();
    const job = jobDesc.toLowerCase();

    // Formatting: check for section headings, consistent structure
    const hasSections = ['experience', 'education', 'skills'].filter((s) => text.includes(s)).length;
    const formatting = Math.min(100, hasSections * 30 + 10);

    // Keywords: overlap between job words and resume
    const jobWords = new Set(job.split(/\s+/).filter((w) => w.length > 4));
    const resumeWords = new Set(text.split(/\s+/));
    let matches = 0;
    jobWords.forEach((w) => { if (resumeWords.has(w)) matches++; });
    const keywords = jobWords.size > 0 ? Math.min(100, Math.round((matches / jobWords.size) * 100)) : 50;

    // Structure: checks for dates, bullet points, quantification
    const hasDates = /\d{4}/.test(resume.resumeText) ? 30 : 0;
    const hasBullets = (resume.resumeText.match(/^[\•\-\*]/m) != null) ? 40 : 0;
    const hasNumbers = /\d+%|\d+\+/.test(resume.resumeText) ? 30 : 0;
    const structure = Math.min(100, hasDates + hasBullets + hasNumbers);

    // Content quality
    const actionVerbs = ['led','built','developed','designed','implemented','improved','achieved','managed','created','launched'];
    const verbCount = actionVerbs.filter((v) => text.includes(v)).length;
    const content = Math.min(100, verbCount * 10 + (resume.parsedData?.skills.length ?? 0) * 5);

    return { formatting, keywords, structure, content };
  }

  private _findMissingKeywords(resumeText: string, jobDesc: string): string[] {
    const lower = resumeText.toLowerCase();
    const jobLower = jobDesc.toLowerCase();

    const jobSkills = TECH_SKILLS.filter((s) => jobLower.includes(s));
    const missing = jobSkills.filter((s) => !lower.includes(s));

    const words = jobLower.split(/\s+/).filter((w) => w.length > 5);
    const freq: Record<string, number> = {};
    for (const w of words) freq[w] = (freq[w] ?? 0) + 1;
    const topJobWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([w]) => w)
      .filter((w) => !lower.includes(w));

    return [...new Set([...missing, ...topJobWords])].slice(0, 10);
  }

  private _buildRecommendations(
    missingKeywords: string[],
    parsedData: ParsedResumeData | null,
  ): Recommendation[] {
    const recs: Recommendation[] = [];

    if (missingKeywords.length > 0) {
      recs.push({ field: 'skills', message: `Add these keywords: ${missingKeywords.slice(0, 3).join(', ')}` });
    }
    if (!parsedData?.skills.length) {
      recs.push({ field: 'skills', message: 'Add a dedicated Skills section with technical tools' });
    }
    recs.push({ field: 'experience', message: 'Quantify achievements with numbers (e.g., "improved speed by 40%")' });
    recs.push({ field: 'format', message: 'Use bullet points starting with strong action verbs (Led, Built, Designed)' });

    return recs;
  }

  private async _findResumeById(id: string): Promise<Resume | null> {
    try {
      return await this.resumeRepo.findOne({ where: { id } });
    } catch (err) {
      this.logger.warn('_findResumeById failed', err instanceof Error ? err.message : err);
      return null;
    }
  }
}
