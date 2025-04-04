import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Kiểm tra email đã tồn tại
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    // Kiểm tra số điện thoại đã tồn tại
    const existingUserByPhone = await this.userRepository.findOne({
      where: { phone: registerDto.phone },
    });
    if (existingUserByPhone) {
      throw new ConflictException('Phone number already exists');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Tạo user mới
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Lưu user vào database
    await this.userRepository.save(user);

    // Tạo và trả về token với cấu trúc mới
    const payload = {
      jti: uuidv4(),
      name: user.name,
      unique_name: user.email,
      email: user.email,
      role: 'user',
      Organization: uuidv4(),
      nbf: Math.floor(Date.now() / 1000),
      iat: Math.floor(Date.now() / 1000),
      expiresIn: '30d',
    };

    const token = await this.jwtService.signAsync(payload);
    console.log('Generated token:', token);

    const data = {
      access_token: token,
    };
    return data;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Tạo và trả về token với cấu trúc mới
    const payload = {
      jti: uuidv4(),
      name: user.name,
      unique_name: user.email,
      email: user.email,
      role: 'user',
      Organization: uuidv4(),
      nbf: Math.floor(Date.now() / 1000),
      iat: Math.floor(Date.now() / 1000),
      expiresIn: '30d',
    };

    const token = await this.jwtService.signAsync(payload);

    const data = {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
    return data;
  }
}
