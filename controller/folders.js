const express = require("express");
const Folder = require("../models/Folder");
const authenticate = require("../middlewares/auth");
const router = express.Router();
const mongoose = require("mongoose");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
router.post(
  "/create-folder",
  authenticate,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, parentId } = req.body;
      const userId = req.user._id;
      if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid parent folder ID" });
      }

      const folder = new Folder({
        name,
        parent: parentId || null,
        user: userId,
      });

      await folder.save();
      res.status(201).json({ success: true, folder });
    } catch (error) {
      next(new ErrorHander(error.message, 500));
    }
  })
);

module.exports = router;
