import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  file?: Express.Multer.File;
} 