import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { TerminusModule } from '@nestjs/terminus';
import Joi from 'joi';
import { ResumesModule } from './modules/resumes/resumes.module';
import { AiRewriteModule } from './modules/ai-rewrite/ai-rewrite.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PlatformModule } from './modules/platform/platform.module';
import { Resume } from './modules/resumes/entities/resume.entity';
import { ResumeScore } from './modules/resumes/entities/resume-score.entity';
import { AiRewrite } from './modules/ai-rewrite/entities/ai-rewrite.entity';
import { Referral } from './modules/referrals/entities/referral.entity';
import { AdImpression } from './modules/analytics/entities/ad-impression.entity';
import { AuditLog } from './modules/analytics/entities/audit-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().default(6379),
        ANTHROPIC_API_KEY: Joi.string().allow('').optional(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [Resume, ResumeScore, AiRewrite, Referral, AdImpression, AuditLog],
        synchronize: config.get<string>('NODE_ENV') === 'development',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        { ttl: config.get<number>('THROTTLE_TTL') ?? 60000, limit: config.get<number>('THROTTLE_LIMIT') ?? 100 },
      ],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST') ?? 'localhost',
          port: config.get<number>('REDIS_PORT') ?? 6379,
          password: config.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),
    TerminusModule,
    ResumesModule,
    AiRewriteModule,
    JobsModule,
    ReferralsModule,
    AnalyticsModule,
    PlatformModule,
  ],
})
export class AppModule {}
