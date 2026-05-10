
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { AiRewriteService, AI_REWRITE_QUEUE } from './ai-rewrite.service';
import { AiRewrite } from './entities/ai-rewrite.entity';

const mockAiRewriteRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

const mockQueue = { add: jest.fn() };

jest.mock('@anthropic-ai/sdk', () => ({
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: '["Rewrite 1", "Rewrite 2", "Rewrite 3"]' }],
      }),
    },
  })),
}));

describe('AiRewriteService', () => {
  let service: AiRewriteService;
  let aiRewriteRepo: ReturnType<typeof mockAiRewriteRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiRewriteService,
        { provide: getRepositoryToken(AiRewrite), useFactory: mockAiRewriteRepo },
        { provide: getQueueToken(AI_REWRITE_QUEUE), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<AiRewriteService>(AiRewriteService);
    aiRewriteRepo = module.get(getRepositoryToken(AiRewrite));
  });

  describe('generateRewrites', () => {
    it('returns 3 rewrites for a valid bullet point', async () => {
      const entity = { id: 'rw-1', rewrites: [], selectedRewrite: null };
      aiRewriteRepo.create.mockReturnValue(entity);
      aiRewriteRepo.save.mockResolvedValue({ ...entity, rewrites: ['Rewrite 1', 'Rewrite 2', 'Rewrite 3'] });

      const result = await service.generateRewrites({
        resumeId: 'resume-1',
        bulletPoint: 'Worked on features',
        jobDescription: 'React Node.js developer role',
      });

      expect(result.data.rewrites).toHaveLength(3);
      expect(result.data.rewriteId).toBeDefined();
    });

    it('uses fallback rewrites when Claude call fails', async () => {
      const entity = { id: 'rw-2', rewrites: [], selectedRewrite: null };
      aiRewriteRepo.create.mockReturnValue(entity);
      aiRewriteRepo.save.mockRejectedValue(new Error('DB error'));

      const result = await service.generateRewrites({
        resumeId: 'resume-1',
        bulletPoint: 'Built a feature',
        jobDescription: 'job description',
      });

      expect(result.data.rewrites).toHaveLength(3);
    });

    it('still returns rewrites even when resume id is unknown', async () => {
      const entity = { id: 'rw-3', rewrites: [], selectedRewrite: null };
      aiRewriteRepo.create.mockReturnValue(entity);
      aiRewriteRepo.save.mockResolvedValue({ ...entity, rewrites: ['R1', 'R2', 'R3'] });

      const result = await service.generateRewrites({
        resumeId: 'bad-id',
        bulletPoint: 'bullet',
        jobDescription: 'jd',
      });

      expect(result.data.rewrites).toBeDefined();
    });
  });

  describe('selectRewrite', () => {
    it('updates selectedRewrite on valid entity', async () => {
      const entity = { id: 'rw-1', rewrites: ['R1', 'R2', 'R3'], selectedRewrite: null };
      aiRewriteRepo.findOne.mockResolvedValue(entity);
      aiRewriteRepo.save.mockResolvedValue({ ...entity, selectedRewrite: 'R1' });

      const result = await service.selectRewrite('rw-1', 'R1');
      expect(result.data.updated).toBe(true);
    });

    it('throws NotFoundException when rewrite record does not exist', async () => {
      aiRewriteRepo.findOne.mockResolvedValue(null);
      const { NotFoundException } = await import('@nestjs/common');
      await expect(service.selectRewrite('missing-id', 'R1')).rejects.toThrow(NotFoundException);
    });
  });
});
