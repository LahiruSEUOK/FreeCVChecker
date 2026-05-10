import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface MasterData {
  countries: Array<{ code: string; name: string }>;
  currencies: Array<{ code: string; symbol: string; name: string }>;
  languages: Array<{ code: string; name: string }>;
}

@Injectable()
export class PlatformService {
  private readonly logger = new Logger(PlatformService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  getMasterData(): { message: string; data: MasterData } {
    return {
      message: 'Master data fetched successfully',
      data: {
        countries: [
          { code: 'LK', name: 'Sri Lanka' },
          { code: 'IN', name: 'India' },
          { code: 'PH', name: 'Philippines' },
        ],
        currencies: [
          { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
          { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
          { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
          { code: 'USD', symbol: '$', name: 'US Dollar' },
        ],
        languages: [
          { code: 'en', name: 'English' },
          { code: 'si', name: 'Sinhala' },
        ],
      },
    };
  }

  async getDatabaseHealth(): Promise<{ status: string; latency: string }> {
    try {
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      const latency = Date.now() - start;
      return { status: 'ok', latency: `${latency}ms` };
    } catch (err) {
      this.logger.error('Database health check failed', err instanceof Error ? err.stack : err);
      return { status: 'error', latency: 'N/A' };
    }
  }
}
