import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, OneToMany, Index,
} from 'typeorm';
import { ResumeScore } from './resume-score.entity';
import { AiRewrite } from '../../ai-rewrite/entities/ai-rewrite.entity';

export interface ParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience: Array<{ title: string; company: string; duration: string; bullets: string[] }>;
  education: Array<{ degree: string; institution: string; year: string }>;
  projects: Array<{ name: string; description: string; tech: string[] }>;
  summary?: string;
}

@Entity('resumes')
@Index('idx_resumes_user_id', ['userIdentifier'])
export class Resume {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_identifier', type: 'varchar', length: 255, nullable: true })
  userIdentifier!: string | null;

  @Column({ name: 'resume_text', type: 'text' })
  resumeText!: string;

  @Column({ name: 'parsed_data', type: 'jsonb', nullable: true })
  parsedData!: ParsedResumeData | null;

  @Column({ name: 'file_format', type: 'varchar', length: 10, nullable: true })
  fileFormat!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @OneToMany(() => ResumeScore, (score) => score.resume)
  scores!: ResumeScore[];

  @OneToMany(() => AiRewrite, (rewrite) => rewrite.resume)
  rewrites!: AiRewrite[];
}
