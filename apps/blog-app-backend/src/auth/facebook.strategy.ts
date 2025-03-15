import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { LoggerService } from '../shared/logger.service';
import { Provider } from '@prisma/client';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private logger: LoggerService) {
    super({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/facebook/callback`,
      scope: 'email',
      profileFields: ['emails', 'name', 'photos'],
    });
    this.logger.log('Facebook Strategy initialized', 'FacebookStrategy');
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    try {
      this.logger.log(`Validating Facebook profile for user ID: ${profile.id}`, 'FacebookStrategy');
      
      const { name, emails, photos } = profile;
      const user = {
        email: emails?.[0]?.value,
        firstName: name?.givenName,
        lastName: name?.familyName,
        picture: photos?.[0]?.value,
        accessToken,
        provider: 'FACEBOOK' as Provider
      };

      if (!user.email) {
        this.logger.warn(`Facebook profile ${profile.id} has no email`, 'FacebookStrategy');
      }

      this.logger.log(`Successfully validated Facebook profile${user.email ? ` for user: ${user.email}` : ''}`, 'FacebookStrategy');
      done(null, user);
    } catch (error) {
      this.logger.error('Failed to validate Facebook profile', error.stack, 'FacebookStrategy');
      done(error, null);
    }
  }
}
