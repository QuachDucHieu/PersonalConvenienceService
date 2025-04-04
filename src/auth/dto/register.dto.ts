import { IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  @Length(1, 100)
  email: string;

  @IsString()
  @Length(1, 15)
  @Matches(/^[0-9]+$/, { message: 'Phone must contain only numbers' })
  phone: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
} 