import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import createError from "http-errors";
import categoriesRoutes from "./routes/v1/categories.route";
import brandsRoutes from "./routes/v1/brands.route";
import productsRoutes from "./routes/v1/products.route";
import staffsRoutes from "./routes/v1/staffs.route";
import customersRoutes from "./routes/v1/customers.route";
import authRoutes from "./routes/v1/auth.route";
import ordersRoutes from "./routes/v1/orders.route";
import uploadRoutes from "./routes/v1/upload.route";
import specificationsRoutes from "./routes/v1/specifications.route";
import bannersRoutes from "./routes/v1/banner.route";
import path from "path";
import compression from "compression";
import { sendJsonErrors } from "./helpers/responseHandler";
import { Server } from "socket.io";
import http from "http"; // Thêm import http
import { setIo } from "./common/websocket";
import jwt from "jsonwebtoken";
import globalConfig from "./configs/globalConfig";

const app: Express = express();

// Tạo HTTP server từ Express app
const server = http.createServer(app);

// Khởi tạo WebSocket server và gắn vào HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000, // Tăng ping timeout lên 60 giây
  pingInterval: 25000,
});

setIo(io);

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "../public")));

/* ===== ROUTES LIST =====*/
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/brands", brandsRoutes);
app.use("/api/v1/staffs", staffsRoutes);
app.use("/api/v1/products", productsRoutes);
app.use("/api/v1/customers", customersRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/orders", ordersRoutes); // Truyền io vào ordersRoutes
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/specifications", specificationsRoutes);
app.use("/api/v1/banners", bannersRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Server is running!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    uptime: process.uptime(),
  });
});

// error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// Báo lỗi dạng json
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  const statusCode = err.status || 500;
  sendJsonErrors(res, err);
});

app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  const statusCode = err.status || 500;
  sendJsonErrors(res, err);
});

// Middleware kiểm tra token cho WebSocket
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: Token required"));
  }

  try {
    const decoded = jwt.verify(token, globalConfig.JWT_SECRET || "TMTA");
    socket.data.user = decoded; // Lưu thông tin user vào socket
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("joinOrderRoom", (orderId) => {
    socket.join(orderId);
    console.log(`Client ${socket.id} joined room ${orderId}`);
  });

  socket.on("disconnect", (reason) => {
    console.log("Client disconnected:", socket.id, "Reason:", reason);
  });
});

// Export cả app và server để sử dụng trong file server chính
export { app, server, io };