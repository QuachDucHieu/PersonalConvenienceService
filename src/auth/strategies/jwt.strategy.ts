import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  unique_name: string;
  email?: string;
  role?: string;
  Organization?: string;
  name?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secretKey = configService.get<string>('JWT_SECRET');
    if (!secretKey) {
      throw new Error('JWT_SECRET is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
  }

  async validate(payload: JwtPayload) {
    console.log('JWT payload:', payload);
    if (!payload || !payload.unique_name) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return {
      email: payload.unique_name,
    };
  }
} 