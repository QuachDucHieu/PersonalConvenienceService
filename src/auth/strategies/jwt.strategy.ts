import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

interface JwtPayload {
  jti: string;
  name: string;
  unique_name: string;
  email: string;
  role: string;
  Organization: string;
  nbf: number;
  exp: number;
  iat: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'duahauhihi', // Nên dùng biến môi trường trong thực tế
    });
  }

  async validate(payload: JwtPayload) {
    
    if (!payload) {
      console.log('Invalid token payload - payload is null or undefined');
      throw new UnauthorizedException('Invalid token payload');
    }

    // Trả về thông tin user từ payload
    return {
      userId: payload.unique_name, // hoặc có thể dùng một trường khác làm userId
      email: payload.email,
      role: payload.role,
      organization: payload.Organization,
      name: payload.name,
    };
  }
} 