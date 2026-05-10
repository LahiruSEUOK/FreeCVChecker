import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('ad_impressions')
@Index('idx_ad_impressions_created', ['createdAt'])
export class AdImpression {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ name: 'user_identifier', type: 'varchar', length: 255, nullable: true })
  userIdentifier!: string | null;

  @Column({ name: 'ad_unit', type: 'varchar', length: 100, nullable: true })
  adUnit!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  position!: string | null;

  @Column({ type: 'boolean', default: false })
  clicked!: boolean;

  @Column({ type: 'decimal', precision: 19, scale: 4, nullable: true })
  revenue!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
