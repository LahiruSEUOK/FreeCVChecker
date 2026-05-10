import { IsString, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ScoreResumeDto {
  @ApiProperty({ description: 'Resume ID from upload step' })
  @IsUUID()
  resumeId!: string;

  @ApiProperty({ description: 'Job description text to score against' })
  @IsString()
  @MinLength(50)
  @MaxLength(10000)
  jobDescription!: string;
}
