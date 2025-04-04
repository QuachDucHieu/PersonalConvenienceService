import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Not } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(currentUserEmail: string) {
    // Lấy thông tin user hiện tại
    const currentUser = await this.findByEmail(currentUserEmail);
    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }

    // Lấy tất cả user trừ user hiện tại
    return await this.userRepository.find({
      where: { id: Not(currentUser.id) },
      select: ['id', 'name', 'email', 'phone'], // Không trả về password
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(email: string, password: string): Promise<User> {
    const user = this.userRepository.create({
      email,
      password, // Trong thực tế nên hash password trước khi lưu
    });
    return this.userRepository.save(user);
  }
} 