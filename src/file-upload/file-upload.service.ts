import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  constructor(private configService: ConfigService) {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // Tạo thư mục uploads nếu chưa tồn tại
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Tạo tên file duy nhất
    const uniqueFileName = `${uuidv4()}-${file.originalname}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Lưu file
    fs.writeFileSync(filePath, file.buffer);

    // Trả về URL của file
    return `/uploads/${uniqueFileName}`;
  }
} 