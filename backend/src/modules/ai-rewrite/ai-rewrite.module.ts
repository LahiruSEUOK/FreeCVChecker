import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AiRewrite } from './entities/ai-rewrite.entity';
import { AiRewriteController } from './ai-rewrite.controller';
import { AiRewriteService, AI_REWRITE_QUEUE } from './ai-rewrite.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiRewrite]),
    BullModule.registerQueue({ name: AI_REWRITE_QUEUE }),
  ],
  controllers: [AiRewriteController],
  providers: [AiRewriteService],
  exports: [AiRewriteService],
})
export class AiRewriteModule {}
