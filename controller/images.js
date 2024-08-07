const express = require("express");
const mongoose = require("mongoose");
const Image = require("../models/Image");
const Folder = require("../models/Folder");
const authenticate = require("../middlewares/auth");
const { upload } = require("../multer");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const router = express.Router();

router.post(
  "/upload-image",
  [authenticate, upload.array("image")],
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, folderId } = req.body;
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No files uploaded" });
      }

      const imageIds = [];

      for (const file of req.files) {
        const { path: imagePath, originalname } = file;

        const image = new Image({
          name,
          path: imagePath,
          folder: folderId,
          user: req.user._id,
        });

        // Save the image document
        await image.save();

        imageIds.push(image._id);
      }

      await Folder.findByIdAndUpdate(folderId, {
        $push: { images: { $each: imageIds } },
      });

      res
        .status(201)
        .json({ success: true, message: "Images uploaded successfully" });
    } catch (error) {
      next(new ErrorHander(error.message, 500));
    }
  })
);

module.exports = router;
