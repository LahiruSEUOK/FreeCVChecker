import {
  Controller, Post, Body, UseInterceptors,
  UploadedFile, Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { ResumesService } from './resumes.service';
import { ScoreResumeDto } from './dto/score-resume.dto';

@ApiTags('resumes')
@Controller('api/v1/resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload and parse a resume file (PDF, DOCX, TXT)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('resume', { limits: { fileSize: 5 * 1024 * 1024 } }))
  uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? req.socket.remoteAddress ?? 'unknown';
    const userIdentifier = Buffer.from(ip).toString('base64').slice(0, 20);
    return this.resumesService.uploadAndParse(file, userIdentifier);
  }

  @Post('score')
  @ApiOperation({ summary: 'Score a resume against a job description' })
  scoreResume(@Body() dto: ScoreResumeDto) {
    return this.resumesService.scoreResume(dto.resumeId, dto.jobDescription);
  }
}
