import { IsIn, IsInt, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TrackShareDto {
  @ApiProperty({ enum: ['whatsapp', 'linkedin', 'twitter', 'copy'] })
  @IsString()
  @IsIn(['whatsapp', 'linkedin', 'twitter', 'copy'])
  sharePlatform!: string;

  @ApiProperty({ description: 'ATS score to embed in share message', minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  score!: number;

  @ApiProperty({ description: 'Role the user scored for', required: false })
  @IsString()
  role?: string;
}
