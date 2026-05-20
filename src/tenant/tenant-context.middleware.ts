import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Inyecta tenantId desde header X-Tenant-Id o desde path param :tenantId
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: Request & { tenantId?: string }, _res: Response, next: NextFunction) {
    const tenantId = (req.headers['x-tenant-id'] as string) || (req.params?.tenantId as string);

    if (!tenantId) {
      throw new UnauthorizedException('X-Tenant-Id header or tenantId path param required');
    }

    req.tenantId = tenantId;
    next();
  }
}
