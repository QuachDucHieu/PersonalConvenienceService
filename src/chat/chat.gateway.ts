import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Socket> = new Map();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (!payload || !payload.unique_name) {
        client.disconnect();
        return;
      }

      // Lưu socket của user
      this.userSockets.set(payload.unique_name, client);
      console.log(`Client connected: ${payload.unique_name}`);
    } catch (error: unknown) {
      console.log(error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Xóa socket của user khi disconnect
    for (const [email, socket] of this.userSockets.entries()) {
      if (socket === client) {
        this.userSockets.delete(email);
        console.log(`Client disconnected: ${email}`);
        break;
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    payload: { receiverId: number; content: string },
  ) {
    try {
      const token = client.handshake.auth.token;
      const jwtPayload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (!jwtPayload || !jwtPayload.unique_name) {
        return;
      }

      // Gửi tin nhắn
      const message = await this.chatService.sendMessage(
        jwtPayload.unique_name,
        payload.receiverId,
        payload.content,
      );

      // Tìm socket của người nhận
      const receiver = await this.chatService.getUserById(payload.receiverId);
      if (receiver && this.userSockets.has(receiver.email)) {
        const receiverSocket = this.userSockets.get(receiver.email);
        if(receiverSocket) receiverSocket.emit('newMessage', message);
      }

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}
