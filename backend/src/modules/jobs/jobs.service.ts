import { Injectable, Logger } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

export interface ParsedJob {
  skills: string[];
  yearsExperience: number | null;
  keywords: string[];
  jobTitle: string | null;
  educationRequired: string | null;
  rawText: string;
}

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  parseJobDescription(rawText: string): { message: string; data: ParsedJob } {
    const clean = sanitizeHtml(rawText, { allowedTags: [], allowedAttributes: {} });
    const parsed = this._extractJobData(clean);
    this.logger.log(JSON.stringify({ action: 'JOB_PARSED', keywordCount: parsed.keywords.length }));
    return { message: 'Job description parsed successfully', data: parsed };
  }

  private _extractJobData(text: string): ParsedJob {
    const lower = text.toLowerCase();

    const skillKeywords = [
      'python','java','javascript','typescript','react','angular','vue','node','nodejs',
      'nestjs','spring','django','flask','fastapi','docker','kubernetes','aws','gcp',
      'azure','sql','postgresql','mysql','mongodb','redis','graphql','rest','api',
      'git','ci/cd','agile','scrum','html','css','tailwind','figma','excel','powerbi',
      'machine learning','deep learning','tensorflow','pytorch','data analysis',
    ];
    const skills = skillKeywords.filter((k) => lower.includes(k));

    const yearMatches = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/i);
    const yearsExperience = yearMatches ? parseInt(yearMatches[1], 10) : null;

    const titleMatch = text.match(/(?:job title|position|role)[:\s]+([^\n,]+)/i)
      ?? text.match(/(?:we are looking for a?n?|hiring a?n?|seeking a?n?)\s+([^\n,]+)/i);
    const jobTitle = titleMatch ? titleMatch[1].trim().slice(0, 80) : null;

    const eduPatterns = ['bachelor', 'master', 'phd', 'degree', 'diploma', 'graduate'];
    const educationRequired = eduPatterns.find((p) => lower.includes(p)) ?? null;

    const words = text
      .replace(/[^a-zA-Z0-9\s+#]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .map((w) => w.toLowerCase());
    const freq: Record<string, number> = {};
    for (const w of words) freq[w] = (freq[w] ?? 0) + 1;
    const stopWords = new Set(['with','that','this','from','have','will','your','they','been']);
    const keywords = Object.entries(freq)
      .filter(([w]) => !stopWords.has(w))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([w]) => w);

    return { skills, yearsExperience, keywords, jobTitle, educationRequired, rawText: text };
  }
}
