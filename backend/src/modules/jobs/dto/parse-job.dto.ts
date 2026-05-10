import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParseJobDto {
  @ApiProperty({ description: 'Full job description text to parse' })
  @IsString()
  @MinLength(50)
  @MaxLength(10000)
  jobDescription!: string;
}
