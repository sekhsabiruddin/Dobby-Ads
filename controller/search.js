const express = require("express");
const Image = require("../models/Image");
const authenticate = require("../middlewares/auth");
const mongoose = require("mongoose");
const router = express.Router();
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHander = require("../utils/errorhander");
router.get(
  "/",
  authenticate,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name } = req.query;
      const images = await Image.find({
        name: new RegExp(name, "i"),
        user: req.user._id,
      });
      if (images.length === 0) {
        return res.json({ message: "Image not found" });
      }
      res.json(images);
    } catch (error) {
      next(new ErrorHander(error.message, 500));
    }
  })
);

module.exports = router;
