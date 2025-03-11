import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../shared/logger.service';
import { Provider } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService
  ) {}

  async validateToken(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          provider: true,
          lastLoginAt: true
        }
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error('Token validation failed', error.stack, 'AuthService');
      throw new UnauthorizedException('Invalid token');
    }
  }

  async socialLogin(profile: any) {
    try {
      const email = profile.email;
      if (!email) {
        throw new Error('Email is required');
      }

      // Update or create user
      const user = await this.prisma.user.upsert({
        where: { email },
        update: {
          lastLoginAt: new Date(),
          name: profile.firstName + ' ' + profile.lastName,
          avatar: profile.picture,
          providerId: profile.id
        },
        create: {
          email,
          name: profile.firstName + ' ' + profile.lastName,
          avatar: profile.picture,
          provider: profile.provider as Provider,
          providerId: profile.id,
          lastLoginAt: new Date()
        }
      });

      // Generate JWT token
      const payload = {
        sub: user.id,
        email: user.email,
        provider: user.provider
      };

      const token = this.jwtService.sign(payload, {
        expiresIn: '1d' // Token expires in 1 day
      });

      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          provider: user.provider
        }
      };
    } catch (error) {
      this.logger.error('Social login failed', error.stack, 'AuthService');
      throw error;
    }
  }
}
