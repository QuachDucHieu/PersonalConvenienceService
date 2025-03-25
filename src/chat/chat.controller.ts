import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, Headers, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { Request } from 'express';

@Controller('chat')
@UseGuards(JwtStrategy)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  getUserConversations(@Headers() headers: any, @Req() request: Request) {
    console.log('Request headers:', headers);
    console.log('Authorization header:', headers.authorization);
    console.log('User from request:', request.user);
    
    // TODO: Lấy userId từ JWT token
    const userId = 1; // Tạm thời hardcode
    return this.chatService.getUserConversations(userId);
  }

  @Post('send')
  @UseInterceptors(FileInterceptor('file'))
  sendMessage(
    @Body() messageDto: SendMessageDto,
    // @UploadedFile() file?: Express.Multer.File,
  ) {
    // TODO: Lấy senderId từ JWT token
    const senderId = 1; // Tạm thời hardcode
    return this.chatService.sendMessage(senderId, messageDto);
  }

  @Get('conversations/:otherUserId')
  getConversation(
    @Param('otherUserId', ParseIntPipe) otherUserId: number,
  ) {
    // TODO: Lấy userId từ JWT token
    const userId = 1; // Tạm thời hardcode
    return this.chatService.getConversation(userId, otherUserId);
  }

  @Post('messages/:messageId/read')
  markAsRead(@Param('messageId', ParseIntPipe) messageId: number) {
    // TODO: Lấy userId từ JWT token
    const userId = 1; // Tạm thời hardcode
    return this.chatService.markAsRead(messageId, userId);
  }
} 