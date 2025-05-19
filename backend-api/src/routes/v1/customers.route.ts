import express from "express";
import customerController from "../../controllers/customers.controller";
import verifyToken from "../../middleware/auth.middleware";
import multer from "multer";
import path from "path";

const router = express.Router();

// Cấu hình multer để xử lý upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif)"));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});

// POST /v1/customers/login
router.post("/login", customerController.login);

// POST /v1/customers/google-login
router.post("/google-login", customerController.googleLogin);

// GET /v1/customers/profile
router.get("/profile", verifyToken, customerController.profile);

// POST /v1/customers/refresh-token
router.post("/refresh-token", customerController.refreshToken);

// GET /v1/customers - Get all customers
router.get("", customerController.findAllCustomer);

// GET /v1/customers/:id - Find customer by ID
router.get("/:id", customerController.findCustomerById);

// POST /v1/customers - Create customer
router.post("", customerController.createCustomer);

// PUT /v1/customers/:id - Update customer
router.patch("/:id", verifyToken, customerController.updateCustomer);

// DELETE /v1/customers/:id - Delete customer (soft delete)
router.delete("/:id", verifyToken, customerController.deleteCustomer);

// PUT /v1/customers/restore/:id - Restore deleted customer
router.put("/restore/:id", verifyToken, customerController.restoreCustomer);

// PUT /v1/customers/toggle-status/:id - Toggle account status (active/inactive)
router.put("/toggle-status/:id", verifyToken, customerController.toggleAccountStatus);

// POST /v1/customers/avatar - Update customer avatar
router.post("/avatar", verifyToken, upload.single("avatar"), customerController.updateAvatar);

export default router;