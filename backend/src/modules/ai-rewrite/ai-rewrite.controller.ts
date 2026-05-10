import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiRewriteService } from './ai-rewrite.service';
import { GenerateRewriteDto } from './dto/generate-rewrite.dto';
import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class SelectRewriteDto {
  @ApiProperty()
  @IsString()
  @MaxLength(500)
  selected!: string;
}

@ApiTags('ai-rewrite')
@Controller('api/v1/ai-rewrite')
export class AiRewriteController {
  constructor(private readonly aiRewriteService: AiRewriteService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate 3 AI-powered rewrites for a resume bullet point' })
  generateRewrites(@Body() dto: GenerateRewriteDto) {
    return this.aiRewriteService.generateRewrites(dto);
  }

  @Patch(':rewriteId/select')
  @ApiOperation({ summary: 'Record which rewrite the user selected' })
  selectRewrite(@Param('rewriteId') rewriteId: string, @Body() dto: SelectRewriteDto) {
    return this.aiRewriteService.selectRewrite(rewriteId, dto.selected);
  }
}
