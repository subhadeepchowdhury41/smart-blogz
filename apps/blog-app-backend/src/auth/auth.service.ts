import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../shared/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private logger: LoggerService
  ) {}

  async socialLogin(user: any) {
    const provider = user.provider?.toLowerCase() === 'google' ? 'GOOGLE' : 'FACEBOOK';
    this.logger.log(`Processing ${provider} social login for user: ${user.email}`, 'AuthService');

    try {
      let dbUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: user.email },
          ]
        },
      });

      if (!dbUser) {
        this.logger.log(`Creating new user with email: ${user.email}`, 'AuthService');
        dbUser = await this.prisma.user.create({
          data: {
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.picture,
            provider: provider,
            providerId: user.id
          },
        });
        this.logger.log(`Successfully created new user with ID: ${dbUser.id}`, 'AuthService');
      } else {
        this.logger.log(`Updating existing user with ID: ${dbUser.id}`, 'AuthService');
        dbUser = await this.prisma.user.update({
          where: { id: dbUser.id },
          data: {
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.picture,
            provider: provider,
            providerId: user.id
          },
        });
        this.logger.log(`Successfully updated user with ID: ${dbUser.id}`, 'AuthService');
      }

      const payload = { 
        sub: dbUser.id, 
        email: dbUser.email,
        provider: dbUser.provider 
      };
      
      const token = this.jwtService.sign(payload);
      this.logger.log(`Generated JWT token for user: ${dbUser.email}`, 'AuthService');

      return {
        access_token: token,
        user: dbUser,
      };
    } catch (error) {
      this.logger.error(
        `Social login failed for ${provider} user: ${user.email}`,
        error.stack,
        'AuthService'
      );
      throw error;
    }
  }
}
