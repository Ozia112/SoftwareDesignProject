import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Prisma v6 conecta de forma lazy — $connect() explícito puede bloquearse.
// Se omite onModuleInit: la conexión se abre en la primera query.
@Injectable()
export class PrismaSystemService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaSystemService.name);

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
