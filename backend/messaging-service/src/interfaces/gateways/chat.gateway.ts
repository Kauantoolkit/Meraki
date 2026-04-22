import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { SaveMessageUseCase } from '../../application/use-cases/save-message.use-case';

interface AuthenticatedSocket extends Socket {
  data: {
    user?: {
      id: string;
      email: string;
      name?: string;
      userType: string;
    };
  };
}

interface JoinPayload {
  conversationId: string;
}

interface SendMessagePayload {
  conversationId: string;
  text: string;
  senderName: string;
}

@WebSocketGateway({
  cors: { origin: '*', credentials: false },
  namespace: '/',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly saveMessage: SaveMessageUseCase,
  ) {}

  /**
   * Called immediately when a client connects via socket.io.
   * Validates the JWT from socket.handshake.auth.token.
   * Disconnects the socket if the token is missing or invalid.
   */
  async handleConnection(client: AuthenticatedSocket) {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      this.logger.warn(`[WS] Client ${client.id} rejected — no token`);
      client.emit('error', { message: 'Token JWT obrigatório na conexão' });
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        userType: payload.userType,
      };

      this.logger.log(`[WS] Client connected: ${client.id} (user ${payload.sub})`);
    } catch (err) {
      this.logger.warn(`[WS] Client ${client.id} rejected — invalid token: ${err.message}`);
      client.emit('error', { message: 'Token JWT inválido ou expirado' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data.user?.id ?? 'unknown';
    this.logger.log(`[WS] Client disconnected: ${client.id} (user ${userId})`);
  }

  /**
   * Event: 'join'
   * Payload: { conversationId: string }
   * The client joins a socket.io room identified by conversationId.
   * All subsequent 'new_message' events for that conversation are broadcast to this room.
   */
  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinPayload,
  ) {
    if (!client.data.user) {
      throw new WsException('Não autenticado');
    }

    const { conversationId } = payload;
    if (!conversationId) {
      throw new WsException('conversationId é obrigatório');
    }

    client.join(conversationId);
    this.logger.log(`[WS] User ${client.data.user.id} joined room ${conversationId}`);

    client.emit('joined', { conversationId });
  }

  /**
   * Event: 'send_message'
   * Payload: { conversationId: string, text: string, senderName: string }
   * Persists the message via SaveMessageUseCase, then broadcasts
   * 'new_message' to ALL clients in the conversation room (including sender).
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    if (!client.data.user) {
      throw new WsException('Não autenticado');
    }

    const { conversationId, text, senderName } = payload;

    if (!conversationId || !text) {
      throw new WsException('conversationId e text são obrigatórios');
    }

    try {
      const savedMessage = await this.saveMessage.execute({
        conversationId,
        senderId: client.data.user.id,
        senderName: senderName || client.data.user.name || client.data.user.email,
        text,
      });

      // Broadcast to all clients in the room, including the sender
      this.server.to(conversationId).emit('new_message', savedMessage);

      this.logger.log(
        `[WS] Message saved in conversation ${conversationId} by user ${client.data.user.id}`,
      );
    } catch (err) {
      this.logger.error(`[WS] Error saving message: ${err.message}`);
      client.emit('error', { message: err.message });
    }
  }
}
