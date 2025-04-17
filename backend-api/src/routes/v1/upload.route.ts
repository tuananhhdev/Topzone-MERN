import express, { Request, Response } from "express";
import multer from "multer";
import { buildSlug } from "../../helpers/buildSlug";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = "_" + Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileInfo = path.parse(file.originalname);
    cb(null, buildSlug(fileInfo.name + uniqueSuffix) + fileInfo.ext);
  },
});

/** Bộ lọc hình ảnh và video */
const mediaFilter = function (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const mimetypeAllow = [
    "image/png",
    "image/jpg",
    "image/gif",
    "image/jpeg",
    "image/webp",
    "video/mp4",
  ];
  if (!mimetypeAllow.includes(file.mimetype)) {
    return cb(
      new Error("Only .png, .gif, .jpg, .jpeg, .webp, and .mp4 formats allowed!")
    );
  }
  cb(null, true);
};

const uploadHandle = multer({
  storage: storage,
  fileFilter: mediaFilter,
  limits: { fileSize: 2000000 }, // 2MB mỗi tệp
}).single("file");

const uploadArrayHandle = multer({
  storage: storage,
  fileFilter: mediaFilter,
  limits: { fileSize: 2000000 }, // 2MB mỗi tệp
}).array("files", 10);

router.post("/single-handle", (req, res, next) => {
  uploadHandle(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        statusCode: 400,
        message: err.message,
        typeError: "MulterError",
      });
    } else if (err) {
      return res.status(413).json({
        statusCode: 413,
        message: err.message,
        typeError: "UnKnownError",
      });
    }

    res.status(200).json({
      statusCode: 200,
      message: "success",
      data: {
        link: `uploads/${req.file?.filename}`,
        payload: req.body,
      },
    });
  });
});

router.post("/array-handle", (req: Request, res: Response) => {
  uploadArrayHandle(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        statusCode: 400,
        message: err.message,
        typeError: "MulterError",
      });
    } else if (err) {
      return res.status(413).json({
        statusCode: 413,
        message: err.message,
        typeError: "UnknownError",
      });
    }

    // Kiểm tra nếu không có file nào được upload
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        message: "No files uploaded",
      });
    }

    // Ép kiểu req.files thành một mảng file Multer
    const files = req.files as Express.Multer.File[];

    // Phân loại images và videos
    const images: string[] = [];
    const videos: string[] = [];

    files.forEach((file: Express.Multer.File) => {
      const filePath = `uploads/${file.filename}`;
      if (file.mimetype.startsWith("image/")) {
        images.push(filePath);
      } else if (file.mimetype.startsWith("video/")) {
        videos.push(filePath);
      }
    });

    res.status(200).json({
      statusCode: 200,
      message: "Upload successful",
      data: {
        images,
        videos,
      },
    });
  });
});

export default router;
