import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'referrer_hash', type: 'varchar', length: 255 })
  referrerHash!: string;

  @Column({ name: 'referred_email', type: 'varchar', length: 255, nullable: true })
  referredEmail!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  platform!: string | null;

  @Column({ name: 'score_shared', type: 'smallint', nullable: true })
  scoreShared!: number | null;

  @Column({ name: 'ref_token', type: 'varchar', length: 100, unique: true })
  refToken!: string;

  @Column({ name: 'click_count', type: 'integer', default: 0 })
  clickCount!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
