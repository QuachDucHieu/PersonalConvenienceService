import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Message } from './entities/message.entity';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { FileUploadService } from './file-upload.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, User]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, UserService, FileUploadService],
})
export class ChatModule {} 