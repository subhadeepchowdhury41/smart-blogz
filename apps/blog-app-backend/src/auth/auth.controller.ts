import { Controller, Get, Post, Req, UseGuards, Res, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoggerService } from '../shared/logger.service';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService
  ) {}

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  async validateToken(@Req() req: any) {
    try {
      const user = await this.authService.validateToken(req.user.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider
      };
    } catch (error) {
      this.logger.error('Token validation failed', error.stack, 'AuthController');
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    this.logger.log('Initiating Google authentication', 'AuthController');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    this.logger.log('Received Google callback', 'AuthController');
    try {
      const result = await this.authService.socialLogin(req.user);
      const params = new URLSearchParams({
        token: result.access_token,
        user: encodeURIComponent(JSON.stringify(result.user))
      });
      res.redirect(`http://localhost:4200/login/callback?${params.toString()}`);
    } catch (error) {
      this.logger.error('Google authentication failed', error.stack, 'AuthController');
      res.redirect('http://localhost:4200/login/callback?error=Authentication failed');
    }
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {
    this.logger.log('Initiating Facebook authentication', 'AuthController');
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(@Req() req: any, @Res() res: Response) {
    this.logger.log('Received Facebook callback', 'AuthController');
    try {
      const result = await this.authService.socialLogin(req.user);
      const params = new URLSearchParams({
        token: result.access_token,
        user: encodeURIComponent(JSON.stringify(result.user))
      });
      res.redirect(`http://localhost:4200/login/callback?${params.toString()}`);
    } catch (error) {
      this.logger.error('Facebook authentication failed', error.stack, 'AuthController');
      res.redirect('http://localhost:4200/login/callback?error=Authentication failed');
    }
  }
}
