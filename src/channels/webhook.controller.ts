import { Controller, Post, Get, Body, Param, Headers, Query, Res, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { MessageRouterService } from '../conversation/message-router.service';
import type { IncomingMessageDto } from '../dto/conversation.dto';

@ApiTags('Webhooks')
@Controller(':tenantId')
export class WebhookController {
  constructor(private readonly router: MessageRouterService) {}

  // --- WhatsApp (Meta Cloud API) ---

  @Get('webhook/whatsapp')
  @ApiOperation({ summary: 'WhatsApp webhook verification' })
  verifyWhatsApp(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Param('tenantId') tenantId: string,
    @Res() res: Response,
  ) {
    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN ?? 'verify-token';
    if (mode === 'subscribe' && token === expectedToken) {
      res.send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
  }

  @Post('webhook/whatsapp')
  @HttpCode(200)
  @ApiOperation({ summary: 'WhatsApp message webhook' })
  async handleWhatsApp(
    @Param('tenantId') tenantId: string,
    @Body() body: any,
  ): Promise<{ status: string }> {
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const messageData = change?.value?.messages?.[0];
    const contact = change?.value?.contacts?.[0];

    if (!messageData || messageData.type !== 'text') {
      return { status: 'ignored' };
    }

    const msg: IncomingMessageDto = {
      tenantId,
      channelType: 'WHATSAPP',
      channelId: messageData.from,
      messageId: messageData.id,
      text: messageData.text?.body ?? '',
      timestamp: new Date(parseInt(messageData.timestamp) * 1000).toISOString(),
      metadata: { wabaId: entry?.id, contact: contact?.profile },
    };

    await this.router.route(msg);
    return { status: 'ok' };
  }

  // --- Telegram ---

  @Post('webhook/telegram')
  @HttpCode(200)
  @ApiOperation({ summary: 'Telegram message webhook' })
  async handleTelegram(
    @Param('tenantId') tenantId: string,
    @Body() body: any,
  ): Promise<{ status: string }> {
    const message = body?.message;
    if (!message?.text) return { status: 'ignored' };

    const msg: IncomingMessageDto = {
      tenantId,
      channelType: 'TELEGRAM',
      channelId: String(message.from?.id),
      messageId: String(message.message_id),
      text: message.text,
      timestamp: new Date(message.date * 1000).toISOString(),
      metadata: { chatId: message.chat?.id, username: message.from?.username },
    };

    await this.router.route(msg);
    return { status: 'ok' };
  }

  // --- Web (HTTP polling) ---

  @Post('messages')
  @HttpCode(200)
  @ApiOperation({ summary: 'Web channel message' })
  async handleWebMessage(
    @Param('tenantId') tenantId: string,
    @Body() body: { channelId: string; text: string; messageId?: string },
    @Headers('x-session-id') sessionId?: string,
  ): Promise<{ status: string; conversationId?: string; routedTo?: string; response?: string; stage?: string; score?: number; toolCallsExecuted?: number; leadId?: string; handoffTriggered?: boolean; debugLog?: string[] }> {
    const msg: IncomingMessageDto = {
      tenantId,
      channelType: 'WEB',
      channelId: body.channelId || sessionId || 'anonymous',
      messageId: body.messageId ?? `web-${Date.now()}`,
      text: body.text,
      timestamp: new Date().toISOString(),
    };

    const result = await this.router.route(msg);
    return {
      status: 'ok',
      conversationId: result.conversationId,
      routedTo: result.routedTo,
      response: result.response,
      stage: result.stage,
      score: result.score,
      toolCallsExecuted: result.toolCallsExecuted,
      leadId: result.leadId,
      handoffTriggered: result.handoffTriggered,
      debugLog: result.debugLog,
    };
  }
}
