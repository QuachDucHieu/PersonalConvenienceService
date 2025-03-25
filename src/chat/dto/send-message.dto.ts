import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsNotEmpty()
  @IsNumber()
  receiverId: number;
} 