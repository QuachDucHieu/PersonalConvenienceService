import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private userService: UserService,
  ) {}

  async sendMessage(senderId: number, messageDto: SendMessageDto) {
    // Kiểm tra người nhận có tồn tại
    await this.userService.findById(messageDto.receiverId);

    const message = this.messageRepository.create({
      content: messageDto.content,
      senderId,
      receiverId: messageDto.receiverId,
    });

    return await this.messageRepository.save(message);
  }

  async getConversation(userId: number, otherUserId: number) {
    // Kiểm tra người dùng có tồn tại
    await this.userService.findById(otherUserId);

    return await this.messageRepository.find({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      order: {
        createdAt: 'ASC',
      },
      relations: ['sender', 'receiver'],
    });
  }

  async getUserConversations(userId: number) {
    // Lấy danh sách các cuộc trò chuyện gần nhất
    const conversations = await this.messageRepository
      .createQueryBuilder('message')
      .select('CASE WHEN message.senderId = :userId THEN message.receiverId ELSE message.senderId END', 'otherUserId')
      .addSelect('MAX(message.createdAt)', 'lastMessageTime')
      .where('message.senderId = :userId OR message.receiverId = :userId', { userId })
      .groupBy('CASE WHEN message.senderId = :userId THEN message.receiverId ELSE message.senderId END')
      .orderBy('lastMessageTime', 'DESC')
      .getRawMany();

    // Lấy thông tin chi tiết của mỗi cuộc trò chuyện
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = await this.userService.findById(conv.otherUserId);
        const lastMessage = await this.messageRepository.findOne({
          where: [
            { senderId: userId, receiverId: conv.otherUserId },
            { senderId: conv.otherUserId, receiverId: userId },
          ],
          order: { createdAt: 'DESC' },
        });

        return {
          otherUser,
          lastMessage,
          lastMessageTime: conv.lastMessageTime,
        };
      }),
    );

    return conversationsWithDetails;
  }

  async markAsRead(messageId: number, userId: number) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, receiverId: userId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    message.isRead = true;
    return await this.messageRepository.save(message);
  }
} 