import Redis from 'ioredis';
import { Logger } from '@nestjs/common';

const log = new Logger('RedisFactory');

export function createRedis(keyPrefix = ''): Redis {
  const client = new Redis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    keyPrefix,
    // No bloquea el arranque si Redis aún no está disponible
    lazyConnect: false,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 200, 3000),
  });

  // Sin este handler, un fallo de conexión es un error no capturado que mata el proceso
  client.on('error', (err) => log.warn(`Redis error [${keyPrefix}]: ${err.message}`));
  client.on('connect', () => log.log(`Redis connected [${keyPrefix || 'default'}]`));

  return client;
}
