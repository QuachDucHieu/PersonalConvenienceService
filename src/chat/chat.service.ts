import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { FileUploadService } from '../file-upload/file-upload.service';
import { UserService } from '../user/user.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    private fileUploadService: FileUploadService,
    private userService: UserService,
  ) {}

  async getUserById(id: number) {
    return this.userService.findById(id);
  }

  async sendMessage(
    senderEmail: string,
    receiverId: number,
    content: string,
    file?: Express.Multer.File,
  ) {
    // Tìm sender bằng email
    const sender = await this.userService.findByEmail(senderEmail);
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    // Tìm receiver bằng id
    const receiver = await this.userService.findById(receiverId);
    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    // Tìm hoặc tạo conversation
    let conversation = await this.conversationRepository.findOne({
      where: [
        { user1Id: sender.id, user2Id: receiver.id },
        { user1Id: receiver.id, user2Id: sender.id },
      ],
    });

    if (!conversation) {
      conversation = this.conversationRepository.create({
        user1Id: sender.id,
        user2Id: receiver.id,
      });
      await this.conversationRepository.save(conversation);
    }

    // Xử lý file upload nếu có
    let fileUrl: string | undefined;
    if (file) {
      fileUrl = await this.fileUploadService.uploadFile(file);
    }

    // Tạo message mới
    const message = this.messageRepository.create({
      conversationId: conversation.id,
      senderId: sender.id,
      content,
      fileUrl,
    });

    return this.messageRepository.save(message);
  }

  async getConversation(userEmail: string, otherUserId: number) {
    // Tìm user bằng email
    const user = await this.userService.findByEmail(userEmail);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra người dùng có tồn tại
    const otherUser = await this.userService.findById(otherUserId);
    if (!otherUser) {
      throw new NotFoundException('Other user not found');
    }

    // Tìm conversation giữa hai user
    const conversation = await this.conversationRepository.findOne({
      where: [
        { user1Id: user.id, user2Id: otherUser.id },
        { user1Id: otherUser.id, user2Id: user.id },
      ],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return this.messageRepository.find({
      where: { conversationId: conversation.id },
      order: { createdAt: 'ASC' },
    });
  }

  async getUserConversations(userEmail: string) {
    // Tìm user bằng email
    const user = await this.userService.findByEmail(userEmail);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Lấy tất cả conversations của user
    const conversations = await this.conversationRepository.find({
      where: [
        { user1Id: user.id },
        { user2Id: user.id },
      ],
      relations: ['messages'],
    });

    // Lấy thông tin người dùng và tin nhắn mới nhất cho mỗi conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        // Xác định người dùng khác trong conversation
        const otherUserId = conversation.user1Id === user.id ? conversation.user2Id : conversation.user1Id;
        const otherUser = await this.userService.findById(otherUserId);

        // Sắp xếp tin nhắn theo thời gian và lấy tin nhắn mới nhất
        const sortedMessages = conversation.messages.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const latestMessage = sortedMessages.length > 0 ? sortedMessages[0] : null;

        return {
          id: conversation.id,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            email: otherUser.email,
          },
          latestMessage: latestMessage ? {
            id: latestMessage.id,
            content: latestMessage.content,
            fileUrl: latestMessage.fileUrl,
            createdAt: latestMessage.createdAt,
            senderId: latestMessage.senderId,
          } : null,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        };
      })
    );

    return conversationsWithDetails;
  }

  async getMessages(conversationId: number, userEmail: string) {
    // Tìm user bằng email
    const user = await this.userService.findByEmail(userEmail);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra xem user có thuộc conversation không
    const conversation = await this.conversationRepository.findOne({
      where: [
        { id: conversationId, user1Id: user.id },
        { id: conversationId, user2Id: user.id },
      ],
    });

    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    return this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async markAsRead(messageId: number, userEmail: string) {
    // Tìm user bằng email
    const user = await this.userService.findByEmail(userEmail);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['conversation'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Kiểm tra xem user có phải là người nhận không
    if (message.conversation.user1Id !== user.id && message.conversation.user2Id !== user.id) {
      throw new UnauthorizedException('You are not authorized to mark this message as read');
    }

    return await this.messageRepository.save(message);
  }
} 