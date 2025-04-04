import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Send a message' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        receiverId: { type: 'number' },
        content: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendMessage(
    @Req() req,
    @Body() body: { receiverId: number; content: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('req?.email:', req?.email);
    console.log('req?.user?.email:', req?.user?.email);
    if (!req?.user?.email) {
      throw new UnauthorizedException('User not found');
    }
    return this.chatService.sendMessage(
      req.user.email,
      body.receiverId,
      body.content,
      file,
    );
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserConversations(@Req() req) {
    if (!req.user?.email) {
      throw new UnauthorizedException('User not found');
    }
    console.log('Request headers:', req.headers);
    console.log('Authorization header:', req.headers.authorization);
    console.log('User from request:', req.user);
    return this.chatService.getUserConversations(req.user.email);
  }

  @Get('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getMessages(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Req() req,
  ) {
    if (!req.user?.email) {
      throw new UnauthorizedException('User not found');
    }
    return this.chatService.getMessages(conversationId, req.user.email);
  }

  @Post('messages/:messageId/read')
  @ApiOperation({ summary: 'Mark a message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async markAsRead(
    @Param('messageId', ParseIntPipe) messageId: number,
    @Req() req,
  ) {
    if (!req.user?.email) {
      throw new UnauthorizedException('User not found');
    }
    return this.chatService.markAsRead(messageId, req.user.email);
  }
} 