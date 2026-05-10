import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PlatformService, MasterData } from './platform.service';

@ApiTags('platform')
@Controller()
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Get('api/health')
  @ApiOperation({ summary: 'Health check — public, no auth' })
  async health(): Promise<Record<string, unknown>> {
    const dbHealth = await this.platformService.getDatabaseHealth();
    return {
      status: 'ok',
      database: dbHealth,
      redis: { status: 'ok' },
      queues: { ai_rewrite: { status: 'active' } },
    };
  }

  @Get('api/v1/platform/master-data')
  @ApiOperation({ summary: 'Master data — countries, currencies, languages' })
  getMasterData(): { message: string; data: MasterData } {
    return this.platformService.getMasterData();
  }
}
