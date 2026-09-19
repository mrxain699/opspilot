import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types/jwt-payload';
import { TokenService } from './token.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.tokenService.createAccessToken(payload);
    const refreshToken = await this.tokenService.createRefreshToken(payload);

    await this.storeRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, name, password } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      email,
      name,
      passwordHash,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;

    try {
      payload = await this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedToken = await this.findValidRefreshToken(
      payload.sub,
      refreshToken,
    );

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    await this.prisma.refreshToken.update({
      where: {
        id: storedToken.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    const newPayload: JwtPayload = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    const accessToken = await this.tokenService.createAccessToken(newPayload);

    const newRefreshToken =
      await this.tokenService.createRefreshToken(newPayload);

    await this.storeRefreshToken(payload.sub, newRefreshToken);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const tokenHash = await this.tokenService.hashToken(refreshToken);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  private async findValidRefreshToken(userId: string, refreshToken: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    for (const token of tokens) {
      const matches = await bcrypt.compare(refreshToken, token.tokenHash);

      if (matches) {
        return token;
      }
    }

    return null;
  }
}
