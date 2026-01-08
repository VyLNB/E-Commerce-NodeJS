const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
import { env } from "./environment.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        env.APP_HOST + ":" + env.APP_PUBLIC_PORT + env.GOOGLE_REDIRECT_URI,
    },
    function (accessToken, refreshToken, profile, done) {
      // Hàm này sẽ được gọi sau khi Google xác thực người dùng thành công.
      // `profile` chứa thông tin người dùng từ Google.
      // `done` là một callback, tham số thứ hai là thông tin user sẽ được gắn vào `req.user`.
      return done(null, profile);
    }
  )
);
