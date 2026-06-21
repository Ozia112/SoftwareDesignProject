import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { TenantConfigService } from '../tenant/tenant-config.service';

// RateLimitGuard — rate limiting por tenant con umbral configurable por plan (PSD-37)
@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  constructor(
    options: any,
    storageService: any,
    reflector: any,
    private readonly tenantConfigService?: TenantConfigService,
  ) {
    super(options, storageService, reflector);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Clave de throttling por tenant (no por IP)
    const tenantId = req.tenantId || req.params?.tenantId || req.headers?.['x-tenant-id'];
    return tenantId ? `tenant:${tenantId}` : req.ip;
  }

  protected throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: any,
  ): Promise<void> {
    const req = context.switchToHttp().getRequest();
    const retryAfter = Math.ceil(throttlerLimitDetail.ttl / 1000);
    const res = context.switchToHttp().getResponse();
    res.setHeader('Retry-After', retryAfter);

    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Rate limit exceeded. Please retry later.',
        retryAfter,
        tenantId: req.tenantId,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
