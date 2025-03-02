import { env } from '@config/env';
import { createUserRepository } from '@modules/user/user.repo';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

const userRepo = createUserRepository(); // Instantiate user repo

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from Authorization header
  secretOrKey: env.JWT_SECRET, // Secret key to verify JWT signature
};

const jwtStrategy = new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await userRepo.findUserById(payload.id); // Find user by ID from JWT payload
    if (user) {
      return done(null, user); // User found, attach user to request
    } else {
      return done(null, false); // User not found
    }
  } catch (error) {
    return done(error, false); // Error during user lookup
  }
});

passport.use('jwt', jwtStrategy); // Register JWT strategy with passport

export const passportSetup = () => {
  passport.initialize();
};

export const jwtAuth = () => passport.authenticate('jwt', { session: false }); // Middleware to protect routes using JWT strategy
