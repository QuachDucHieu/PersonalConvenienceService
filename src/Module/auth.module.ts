import { Module } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { AuthController } from '../auth/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { UserService } from '../user/user.service';
import { UserController } from '../user/user.controller';
import { ChatController } from 'src/chat/chat.controller';
import { ChatService } from 'src/chat/chat.service';
import { Message } from 'src/chat/entities/message.entity';
import { Conversation } from 'src/chat/entities/conversation.entity';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Message, Conversation]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    FileUploadModule,
  ],
  controllers: [AuthController, UserController, ChatController],
  providers: [AuthService, JwtStrategy, UserService, ChatService],
  exports: [AuthService],
})
export class AuthModule {}
