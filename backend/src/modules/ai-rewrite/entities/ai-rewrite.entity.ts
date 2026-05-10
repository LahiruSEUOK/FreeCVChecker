import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Resume } from '../../resumes/entities/resume.entity';

@Entity('ai_rewrites')
export class AiRewrite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'resume_id', type: 'uuid' })
  resumeId!: string;

  @Column({ name: 'original_bullet', type: 'text' })
  originalBullet!: string;

  @Column({ type: 'text', array: true, default: '{}' })
  rewrites!: string[];

  @Column({ name: 'selected_rewrite', type: 'text', nullable: true })
  selectedRewrite!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Resume, (resume) => resume.rewrites)
  @JoinColumn({ name: 'resume_id' })
  resume!: Resume;
}
