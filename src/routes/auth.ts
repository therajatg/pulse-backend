import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/User";
import { JWT_SECRET } from "../constants";

const router = express.Router();

const generateToken = (id: string) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });
};

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const userExists = await UserModel.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await UserModel.create({
      email,
      password,
      role: role || "editor",
    });

    res.status(201).json({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString()),
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString()),
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
