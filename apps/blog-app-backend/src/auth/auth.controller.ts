import { Controller, Get, Post, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoggerService } from '../shared/logger.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService
  ) {}

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
      res.redirect(`http://localhost:4200/login?${params.toString()}`);
    } catch (error) {
      this.logger.error('Google authentication failed', error.stack, 'AuthController');
      res.redirect('http://localhost:4200/login?error=Authentication failed');
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
      res.redirect(`http://localhost:4200/login?${params.toString()}`);
    } catch (error) {
      this.logger.error('Facebook authentication failed', error.stack, 'AuthController');
      res.redirect('http://localhost:4200/login?error=Authentication failed');
    }
  }
}
