import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwt-payload';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async createAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });
  }

  async createRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
  }

  async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }
}
