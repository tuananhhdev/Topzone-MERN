import mongoose from "mongoose";
import globalConfig from "./src/configs/globalConfig";
import { server } from "./src/app";

// Cấu hình cổng từ globalConfig
const PORT = globalConfig.PORT;

// Hàm kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(globalConfig.MONGODB_URI as string);
    console.log("⚡️[MongoDB]: Connected to MongoDB successfully");
  } catch (err) {
    console.error("Failed to Connect to MongoDB", err);
    process.exit(1); // Thoát nếu không kết nối được DB
  }
};

// Hàm khởi động server
const startServer = async () => {
  // Đợi kết nối DB thành công trước khi khởi động server
  await connectDB();

  // Khởi động server sau khi DB sẵn sàng
  server.listen(PORT, () => {
    console.log(`⚡[Express]: listening on port http://localhost:${PORT}`);
  });
};

// Xử lý lỗi không bắt được (uncaught exceptions)
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Xử lý promise rejection không bắt được
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Gọi hàm khởi động server
startServer();