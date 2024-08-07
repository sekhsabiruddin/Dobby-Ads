const express = require("express");
const router = express.Router();
const User = require("../models/user");

const jwt = require("jsonwebtoken");
const isAuthenticatedUser = require("../middlewares/auth");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

//=======================Create User Start============================
router.post(
  "/signup",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { username, password, email } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const newUser = new User({
        username,
        password,
        email,
      });
      await newUser.save();
      res
        .status(201)
        .json({ message: "User created successfully", user: newUser });
    } catch (error) {
      next(new ErrorHander(error.message, 500));
    }
  })
);
//=======================Create User End===============================
//=======================LogIn User Start==============================
router.post(
  "/login",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide both email and password",
        });
      }

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const isPasswordMatched = await user.comparePassword(password);
      if (!isPasswordMatched) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      // Set token in cookie
      res.cookie("token", token, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });

      // Send response
      res.status(200).json({
        success: true,
        message: "Login successful",
      });
    } catch (error) {
      next(new ErrorHander(error.message, 500));
    }
  })
);

//=======================LogIn User End==============================
//=======================Get User Start===============================

//=======================Get User End===============================
router.post(
  "/logout",
  isAuthenticatedUser,
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      res.status(201).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error) {
      next(new ErrorHander(error.message, 500));
    }
  })
);

module.exports = router;
