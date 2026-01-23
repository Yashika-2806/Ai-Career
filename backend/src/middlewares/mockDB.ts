import { Request, Response, NextFunction } from 'express';

/**
 * Mock database middleware - bypasses DB for testing
 * Replace this with real MongoDB once connection is fixed
 */

// In-memory user storage
const mockUsers: any[] = [];
let userIdCounter = 1;

export const mockDB = {
  /**
   * Mock User.findOne
   */
  findUserByEmail: (email: string) => {
    return mockUsers.find(u => u.email === email);
  },

  /**
   * Mock User.save
   */
  createUser: (userData: any) => {
    const newUser = {
      _id: (userIdCounter++).toString(),
      ...userData,
      createdAt: new Date(),
    };
    mockUsers.push(newUser);
    return newUser;
  },

  /**
   * Mock User.findById
   */
  findUserById: (id: string) => {
    return mockUsers.find(u => u._id === id);
  },

  /**
   * Get all users (for debugging)
   */
  getAllUsers: () => mockUsers,
};

/**
 * Middleware to inject mock DB into request
 */
export const mockDBMiddleware = (req: Request, res: Response, next: NextFunction) => {
  (req as any).mockDB = mockDB;
  next();
};
