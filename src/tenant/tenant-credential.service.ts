import { Injectable, Logger } from '@nestjs/common';
import { PrismaSystemService } from './prisma-system.service';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Servicio de credenciales cifradas — PSD-37 / CU-COM-001
@Injectable()
export class TenantCredentialService {
  private readonly logger = new Logger(TenantCredentialService.name);
  private readonly masterKey: Buffer;

  constructor(private readonly prismaSystem: PrismaSystemService) {
    const keyBase64 = process.env.ENCRYPTION_MASTER_KEY ?? '';
    this.masterKey = Buffer.from(keyBase64, 'base64');
    if (this.masterKey.length !== 32) {
      this.logger.warn('ENCRYPTION_MASTER_KEY no tiene 32 bytes — usando clave temporal de dev');
      this.masterKey.fill(0);
      this.masterKey.set(Buffer.alloc(32, 'dev-key-insecure'));
    }
  }

  encrypt(plain: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv) as crypto.CipherGCM;
    const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  }

  decrypt(encrypted: string): string {
    const buf = Buffer.from(encrypted, 'base64');
    const iv = buf.subarray(0, IV_LENGTH);
    const tag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, this.masterKey, iv) as crypto.DecipherGCM;
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  }

  async setCredential(
    tenantId: string,
    credentialType: string,
    plainValue: string,
  ): Promise<void> {
    const encryptedValue = this.encrypt(plainValue);
    await this.prismaSystem.tenantCredential.upsert({
      where: { tenantId_credentialType: { tenantId, credentialType } },
      create: { tenantId, credentialType, encryptedValue, isActive: true },
      update: { encryptedValue, isActive: true, rotatedAt: new Date() },
    });
    this.logger.log(`Credential ${credentialType} upserted for tenant ${tenantId}`);
  }

  async getDecrypted(tenantId: string, credentialType: string): Promise<string | null> {
    const cred = await this.prismaSystem.tenantCredential.findUnique({
      where: { tenantId_credentialType: { tenantId, credentialType } },
    });
    if (!cred || !cred.isActive) return null;
    try {
      return this.decrypt(cred.encryptedValue);
    } catch {
      this.logger.error(`Failed to decrypt ${credentialType} for tenant ${tenantId}`);
      return null;
    }
  }

  async revokeAll(tenantId: string): Promise<void> {
    await this.prismaSystem.tenantCredential.updateMany({
      where: { tenantId },
      data: { isActive: false },
    });
    this.logger.log(`All credentials revoked for tenant ${tenantId}`);
  }
}
