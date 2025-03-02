// src/config/passport.ts
import { env } from '@config/env';
import { Role } from '@modules/user/types'; // Import Role enum if not already present
import { createUserRepository } from '@modules/user/user.repo';
import passport from 'passport';
import {
  Profile,
  Strategy as GoogleStrategy,
  VerifyCallback,
} from 'passport-google-oauth20'; // Import types from passport-google-oauth20
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

const userRepo = createUserRepository();

// JWT Strategy configuration (Keep your existing JWT Strategy)
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.JWT_SECRET,
};

const jwtStrategy = new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await userRepo.findUserById(payload.id);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
});

passport.use('jwt', jwtStrategy);

// Google OAuth 2.0 Strategy Configuration
const googleStrategyConfig = {
  clientID: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  callbackURL: env.GOOGLE_CALLBACK_URL,
  // passReqToCallback: true, // Removed passReqToCallback for now to simplify types - we are not using request
};

const googleStrategy = new GoogleStrategy(
  googleStrategyConfig,
  async (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) => {
    // Explicitly type verify callback parameters
    try {
      const email = profile.emails?.[0].value;
      const name = profile.displayName;

      if (!email) {
        return done(null, false, {
          message: 'No email associated with Google account.',
        });
      }

      const user = await userRepo.findUserByEmail(email);

      if (!user) {
        const newUser = await userRepo.createUser({
          email,
          name,
          password: 'google_oauth_user', // Placeholder password
          role: Role.USER, // Default role
        });
        return done(null, newUser);
      } else {
        return done(null, user);
      }
    } catch (error) {
      return done(error, false);
    }
  },
);

passport.use('google', googleStrategy);

export const passportSetup = () => {
  passport.initialize();
};

export const jwtAuth = () => passport.authenticate('jwt', { session: false });
export const googleAuth = () =>
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
  });
