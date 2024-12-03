import dotenv from "dotenv";
dotenv.config();

/**
 * Tập trung tất cả các thông số
 * - cấu hình chung
 * - biến môi trường
 *  lại một chỗ
 */

export default {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 8081,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
};
