import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check — verifica se a API está online' })
  @ApiResponse({
    status: 200,
    description: 'API está operacional',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-06-16T10:00:00.000Z',
        version: '1.0',
        environment: 'production',
      },
    },
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0',
      environment: process.env.NODE_ENV ?? 'development',
    };
  }
}
