import express from "express";
import multer from "multer";
import { buildSlug } from "../../helpers/buildSlug";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      "_" + Date.now() + "-" + Math.round(Math.random() * 1e9);

    const fileInfo = path.parse(file.originalname);

    cb(null, buildSlug(fileInfo.name + uniqueSuffix) + fileInfo.ext);
  },
});

/** Bộ lọc hình ảnh */
const imageFilter = function (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  // Mot mang cac dinh dang tap tin cho phep duoc tai len
  const mimetypeAllow = [
    "image/png",
    "image/jpg",
    "image/gif",
    "image/jpeg",
    "image/webp",
  ];
  if (!mimetypeAllow.includes(file.mimetype)) {
    //req.fileValidationError = 'Only .png, .gif, .jpg, webp, and .jpeg format allowed!';
    return cb(
      new Error("Only .png, .gif, .jpg, webp, and .jpeg format allowed!")
    );
  }
  cb(null, true);
};

const uploadHandle = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: { fileSize: 2000000 }, //2MB in bytes
}).single("file");
const uploadArrayHandle = multer({ storage: storage }).array("files", 5);

router.post("/single-handle", (req, res, next) => {
  uploadHandle(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.log(err);
      return res.status(400).json({
        statusCode: 400,
        message: err.message,
        typeError: "MulterError",
      });
    } else if (err) {
      // An unknown error occurred when uploading.
      console.log(err);
      return res.status(413).json({
        statusCode: 413,
        message: err.message,
        typeError: "UnKnownError",
      });
    }

    // Everything went fine.
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

router.post("/array-handle", (req, res, next) => {
  console.log("req files", req.body);
  uploadArrayHandle(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.log(err);
      res.status(400).send("Error occurred while uploading the file.");
    } else if (err) {
      // An unknown error occurred when uploading.
      console.log(err);
      res.status(400).send("Error occurred while uploading the file.");
    }

    // Everything went fine.
    res.status(200).json({
      message: "Single post created",
      filename: req.files,
    });
  });
});

export default router;
