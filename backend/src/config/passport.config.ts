import {
  Strategy as JwtStrategy,
  ExtractJwt,
  type StrategyOptions,
} from "passport-jwt";
import passport from "passport";
import { Env } from "./env.config.js";
import { findByIdUserService } from "../services/user.service.js";
import { Logger } from "../utils/logger.js";

interface JwtPayload {
  userId: string;
}

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: Env.JWT_SECRET,
  audience: ["user"],
  algorithms: ["HS256"],
};

passport.use(
  new JwtStrategy(options, async (payload: JwtPayload, done) => {
    try {
      if (!payload.userId) {
        Logger.warn("JWT authentication failed: Invalid token payload - missing userId");
        return done(null, false, { message: "Invalid token payload" });
      }

      const user = await findByIdUserService(payload.userId);
      if (!user) {
        Logger.warn("JWT authentication failed: User not found", { userId: payload.userId });
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      Logger.error("JWT authentication error", error);
      return done(error, false);
    }
  })
);

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

export const passportAuthenticateJwt = passport.authenticate("jwt", {
  session: false,
});