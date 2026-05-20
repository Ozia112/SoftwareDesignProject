export interface TenantConfig {
  tenantId: string;
  name: string;
  llmModel: string;
  systemPrompt?: string;
  isActive: boolean;
  planType: string;
  maxRequestsMin: number;
  // Credenciales resueltas en tiempo de ejecución (jamás expuestas en API)
  llmApiKey?: string;
  dbUrl?: string;
  whatsappToken?: string;
  telegramToken?: string;
}

export interface TenantCredentialDto {
  credentialType: 'llm_api_key' | 'whatsapp_token' | 'telegram_token' | 'db_url';
  plainValue: string;
}
