import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';

@Module({
  imports: [TerminusModule],
  controllers: [PlatformController],
  providers: [PlatformService],
})
export class PlatformModule {}
