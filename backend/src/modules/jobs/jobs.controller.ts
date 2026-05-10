import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JobsService, ParsedJob } from './jobs.service';
import { ParseJobDto } from './dto/parse-job.dto';

@ApiTags('jobs')
@Controller('api/v1/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('parse')
  @ApiOperation({ summary: 'Parse a job description and extract skills/keywords' })
  parseJob(@Body() dto: ParseJobDto): { message: string; data: ParsedJob } {
    return this.jobsService.parseJobDescription(dto.jobDescription);
  }
}
