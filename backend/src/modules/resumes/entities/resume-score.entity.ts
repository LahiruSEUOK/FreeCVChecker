import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Resume } from './resume.entity';

export interface ScoreBreakdown {
  formatting: number;
  keywords: number;
  structure: number;
  content: number;
}

export interface Recommendation {
  field: string;
  message: string;
}

@Entity('resume_scores')
@Index('idx_scores_resume_id', ['resumeId'])
export class ResumeScore {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'resume_id', type: 'uuid' })
  resumeId!: string;

  @Column({ name: 'job_description', type: 'text' })
  jobDescription!: string;

  @Column({ type: 'smallint', default: 0 })
  score!: number;

  @Column({ type: 'jsonb', nullable: true })
  breakdown!: ScoreBreakdown | null;

  @Column({ name: 'missing_keywords', type: 'text', array: true, default: '{}' })
  missingKeywords!: string[];

  @Column({ type: 'jsonb', nullable: true })
  recommendations!: Recommendation[] | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Resume, (resume) => resume.scores)
  @JoinColumn({ name: 'resume_id' })
  resume!: Resume;
}
