
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { Resume } from './entities/resume.entity';
import { ResumeScore } from './entities/resume-score.entity';

const mockResumeRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

const mockScoreRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
});

describe('ResumesService', () => {
  let service: ResumesService;
  let resumeRepo: ReturnType<typeof mockResumeRepo>;
  let scoreRepo: ReturnType<typeof mockScoreRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumesService,
        { provide: getRepositoryToken(Resume), useFactory: mockResumeRepo },
        { provide: getRepositoryToken(ResumeScore), useFactory: mockScoreRepo },
      ],
    }).compile();

    service = module.get<ResumesService>(ResumesService);
    resumeRepo = module.get(getRepositoryToken(Resume));
    scoreRepo = module.get(getRepositoryToken(ResumeScore));
  });

  describe('uploadAndParse', () => {
    const validFile = {
      originalname: 'cv.pdf',
      mimetype: 'application/pdf',
      size: 1024 * 100,
      buffer: Buffer.from('John Doe\njohn@example.com\nJavaScript Python Node.js'),
    } as Express.Multer.File;

    it('saves a resume and returns parsed data', async () => {
      const savedResume = { id: 'uuid-1', fileName: 'cv.pdf', parsedData: null };
      resumeRepo.create.mockReturnValue(savedResume);
      resumeRepo.save.mockResolvedValue({ ...savedResume, parsedData: { name: 'John Doe' } });

      const result = await service.uploadAndParse(validFile, 'user-1');

      expect(resumeRepo.create).toHaveBeenCalled();
      expect(resumeRepo.save).toHaveBeenCalledTimes(1);
      expect(result.data.resumeId).toBeDefined();
    });

    it('throws BadRequestException for invalid MIME type', async () => {
      const badFile = { ...validFile, mimetype: 'image/png' } as Express.Multer.File;
      await expect(service.uploadAndParse(badFile, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when file exceeds 5 MB', async () => {
      const bigFile = { ...validFile, size: 6 * 1024 * 1024 } as Express.Multer.File;
      await expect(service.uploadAndParse(bigFile, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when buffer is empty', async () => {
      const emptyFile = { ...validFile, buffer: Buffer.alloc(0) } as Express.Multer.File;
      await expect(service.uploadAndParse(emptyFile, 'user-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('scoreResume', () => {
    const mockResume = {
      id: 'uuid-1',
      parsedData: {
        name: 'Jane',
        email: 'jane@example.com',
        phone: null,
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: [{ company: 'Acme', role: 'Dev', duration: '2022-2024', bullets: ['Built features'] }],
        education: [{ institution: 'MIT', degree: 'BSc CS', year: '2022' }],
        summary: 'Full stack developer',
        rawText: 'JavaScript React Node.js Python',
      },
    };

    it('calculates and saves a score', async () => {
      resumeRepo.findOne.mockResolvedValue(mockResume);
      const savedScore = { id: 'score-1', score: 72, breakdown: {}, missingKeywords: [], recommendations: [] };
      scoreRepo.create.mockReturnValue(savedScore);
      scoreRepo.save.mockResolvedValue(savedScore);

      const jd = 'We need JavaScript React Node.js Python developer with SQL experience and REST API knowledge';
      const result = await service.scoreResume('uuid-1', jd);

      expect(result.data.score).toBeGreaterThanOrEqual(0);
      expect(result.data.score).toBeLessThanOrEqual(100);
      expect(scoreRepo.save).toHaveBeenCalled();
    });

    it('throws NotFoundException when resume does not exist', async () => {
      resumeRepo.findOne.mockResolvedValue(null);
      await expect(service.scoreResume('bad-id', 'jd')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when resume has no parsed data', async () => {
      resumeRepo.findOne.mockResolvedValue({ id: 'uuid-1', parsedData: null });
      await expect(service.scoreResume('uuid-1', 'jd')).rejects.toThrow(BadRequestException);
    });
  });
});
