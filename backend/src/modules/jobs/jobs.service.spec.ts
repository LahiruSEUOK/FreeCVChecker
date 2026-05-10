
import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';

describe('JobsService', () => {
  let service: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobsService],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  describe('parseJobDescription', () => {
    const sampleJd = `
      We are looking for a Software Engineer with 2 years of experience.
      Required skills: JavaScript, TypeScript, React, Node.js, PostgreSQL, REST API, Docker.
      Nice to have: GraphQL, AWS, Kubernetes.
      The candidate should have a Bachelor's degree in Computer Science or related field.
    `;

    it('extracts tech skills from job description', () => {
      const { data } = service.parseJobDescription(sampleJd);
      expect(data.skills).toContain('javascript');
      expect(data.skills).toContain('react');
      expect(data.skills).toContain('nodejs');
    });

    it('extracts years of experience', () => {
      const { data } = service.parseJobDescription(sampleJd);
      expect(data.yearsExperience).toBe(2);
    });

    it('returns empty skills array for empty JD', () => {
      const { data } = service.parseJobDescription('');
      expect(data.skills).toEqual([]);
    });

    it('extracts keywords and filters stop words', () => {
      const { data } = service.parseJobDescription(sampleJd);
      expect(data.keywords).not.toContain('the');
      expect(data.keywords).not.toContain('and');
      expect(data.keywords.length).toBeGreaterThan(0);
    });

    it('handles JD with no years mentioned', () => {
      const noYearsJd = 'Looking for a React developer with JavaScript skills';
      const { data } = service.parseJobDescription(noYearsJd);
      expect(data.yearsExperience).toBeNull();
    });

    it('deduplicates extracted skills', () => {
      const dupJd = 'Need JavaScript developer. JavaScript is required. Must know JavaScript.';
      const { data } = service.parseJobDescription(dupJd);
      const jsCount = data.skills.filter((s: string) => s === 'javascript').length;
      expect(jsCount).toBe(1);
    });
  });
});
