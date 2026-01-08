import dotenv from "dotenv";
dotenv.config({ path: "./secrets/.env" });

export const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,
  APP_PORT: process.env.APP_PORT,
  APP_PUBLIC_PORT: process.env.APP_PUBLIC_PORT,
  APP_HOST: process.env.APP_HOST, // NOTE: cần sửa file .env khi đổi nơi deploy

  FE_CLIENT_HOST: process.env.FE_CLIENT_HOST,
  FE_CLIENT_PUBLIC_PORT: process.env.FE_CLIENT_PUBLIC_PORT,

  DEFAULT_REDIS_HOST: process.env.DEFAULT_REDIS_HOST,
  DEFAULT_REDIS_PORT: process.env.DEFAULT_REDIS_PORT,
  DEFAULT_REDIS_PASSWORD: process.env.DEFAULT_REDIS_PASSWORD,

  GOOGLE_APP_PASSWORD: process.env.GOOGLE_APP_PASSWORD,
  GOOGLE_APP_EMAIL: process.env.GOOGLE_APP_EMAIL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  // NOTE: google redirect uri phải khớp với URI đã đăng ký trên Google Console
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,

  BUILD_MODE: process.env.BUILD_MODE,

  ACCESS_TOKEN_SECRET_SIGNATURE: process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
  REFRESH_TOKEN_SECRET_SIGNATURE: process.env.REFRESH_TOKEN_SECRET_SIGNATURE,
};
