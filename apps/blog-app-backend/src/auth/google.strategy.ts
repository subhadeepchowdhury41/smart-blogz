import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { LoggerService } from '../shared/logger.service';
import { Provider } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private logger: LoggerService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/google/callback`,
      scope: ['email', 'profile'],
    });
    this.logger.log('Google Strategy initialized', 'GoogleStrategy');
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      this.logger.log(`Validating Google profile for user: ${profile.emails[0].value}`, 'GoogleStrategy');
      
      const { name, emails, photos } = profile;
      const user = {
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName,
        picture: photos[0].value,
        accessToken,
        provider: 'GOOGLE' as Provider
      };

      this.logger.log(`Successfully validated Google profile for user: ${user.email}`, 'GoogleStrategy');
      done(null, user);
    } catch (error) {
      this.logger.error('Failed to validate Google profile', error.stack, 'GoogleStrategy');
      done(error, null);
    }
  }
}
