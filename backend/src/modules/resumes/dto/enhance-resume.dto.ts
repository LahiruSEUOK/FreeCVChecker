import { IsString, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnhanceResumeDto {
  @ApiProperty()
  @IsUUID()
  resumeId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(50)
  @MaxLength(10000)
  jobDescription!: string;
}
