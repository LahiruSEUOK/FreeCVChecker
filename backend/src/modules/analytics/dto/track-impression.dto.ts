import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TrackImpressionDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  adUnit!: string;

  @ApiProperty({ enum: ['sidebar', 'banner', 'inline'] })
  @IsString()
  @MaxLength(50)
  position!: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  clicked?: boolean;
}
