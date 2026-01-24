import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import User from '../models/User.js';
import { generateToken } from '../middlewares/auth.js';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';

export const authController = {
  /**
   * User registration
   */
  register: [
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('name').notEmpty(),
  ],
  registerHandler: async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, name, college, branch, yearOfGraduation } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = new User({
        email,
        password: hashedPassword,
        name,
        college,
        branch,
        yearOfGraduation,
      });

      await user.save();

      // Generate token
      const token = generateToken(user._id.toString());

      res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Registration failed', details: error.message });
    }
  },

  /**
   * User login
   */
  login: [
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  loginHandler: async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user._id.toString());

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Login failed', details: error.message });
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async (req: AuthRequest, res: Response) => {
    try {
      const user = await User.findById(req.userId).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (req: AuthRequest, res: Response) => {
    try {
      const { name, college, branch, yearOfGraduation, bio, profilePicture } = req.body;

      const user = await User.findByIdAndUpdate(
        req.userId,
        {
          name,
          college,
          branch,
          yearOfGraduation,
          bio,
          profilePicture,
          updatedAt: new Date(),
        },
        { new: true }
      ).select('-password');

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  /**
   * Link social profile
   */
  linkSocialProfile: async (req: AuthRequest, res: Response) => {
    try {
      const { platform, data } = req.body;

      const user = await User.findByIdAndUpdate(
        req.userId,
        {
          [`socialProfiles.${platform}`]: data,
        },
        { new: true }
      ).select('-password');

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to link social profile' });
    }
  },
};
