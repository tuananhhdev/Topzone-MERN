import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import createError from "http-errors";
import categoriesRoutes from "./routes/v1/categories.route";
import brandsRoutes from "./routes/v1/brands.route";
import productsRoutes from "./routes/v1/products.route";
import staffsRoutes from "./routes/v1/staffs.route";
import customersRoutes from "./routes/v1/customers.route";
import authRoutes from "./routes/v1/auth.route";
import ordersRoutes from "./routes/v1/orders.route";
import uploadRoutes from "./routes/v1/upload.route";
import path from "path";
import compression from "compression";
import { sendJsonErrors } from "./helpers/responseHandler";

const app: Express = express();

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "../public")));
app.use(helmet());

/* ===== ROUTES LIST =====*/
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/brands", brandsRoutes);
app.use("/api/v1/staffs", staffsRoutes);
app.use("/api/v1/products", productsRoutes);
app.use("/api/v1/customers", customersRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/orders", ordersRoutes);
app.use("/api/v1/upload", uploadRoutes);

// error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  const statusCode = err.status || 500;
  sendJsonErrors(res, err);
});

export default app;
