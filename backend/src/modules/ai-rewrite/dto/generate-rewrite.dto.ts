import { IsString, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateRewriteDto {
  @ApiProperty({ description: 'Resume ID' })
  @IsUUID()
  resumeId!: string;

  @ApiProperty({ description: 'The bullet point text to rewrite' })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  bulletPoint!: string;

  @ApiProperty({ description: 'Job description to align rewrites with' })
  @IsString()
  @MinLength(0)
  @MaxLength(10000)
  jobDescription!: string;
}
