import { Router, type Request, type Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Register Admin
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Login Admin
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  console.log(`[DEBUG] Login attempt received for: ${req.body?.username}`);
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username: user.username });
  } catch (error: any) {
    console.error(`[AUTH_ERROR] Login failed for ${req.body?.username || 'unknown'}:`, {
      message: error.message,
      code: error.code,
      dbState: mongoose.connection.readyState
    });
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, newPassword } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    user.password = newPassword; // Pre-save hook will hash it
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
