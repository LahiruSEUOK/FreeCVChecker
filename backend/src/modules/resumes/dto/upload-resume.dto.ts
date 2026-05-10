import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UploadResumeDto {
  @ApiPropertyOptional({ description: 'Optional user identifier (email or session token)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  userIdentifier?: string;
}
