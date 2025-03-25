import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';

@Injectable()
export class FileUploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    // Tạo thư mục uploads nếu chưa tồn tại
    this.ensureUploadDirExists();
  }

  private async ensureUploadDirExists() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File) {
    const fileHash = crypto.randomBytes(16).toString('hex');
    const extension = file.originalname.split('.').pop();
    const fileName = `${fileHash}.${extension}`;
    const filePath = join(this.uploadDir, fileName);

    await fs.writeFile(filePath, file.buffer);

    return {
      fileName: file.originalname,
      fileUrl: `/uploads/${fileName}`,
      fileType: file.mimetype,
      fileSize: file.size,
    };
  }

  async deleteFile(fileName: string) {
    const filePath = join(this.uploadDir, fileName);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
} 