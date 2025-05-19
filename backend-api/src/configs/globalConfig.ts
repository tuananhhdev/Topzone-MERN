import dotenv from "dotenv";
dotenv.config();

export default {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 8080,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  MAIL_APP_USER: process.env.MAIL_APP_USER,
  MAIL_APP_PASSWORD: process.env.MAIL_APP_PASSWORD,
};
