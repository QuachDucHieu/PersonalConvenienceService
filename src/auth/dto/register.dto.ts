import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;

  @IsEmail()
  @Length(1, 100)
  email: string;

  @IsString()
  @Length(1, 15)
  @Matches(/^[0-9]+$/, { message: 'Phone must contain only numbers' })
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  password: string;
} 