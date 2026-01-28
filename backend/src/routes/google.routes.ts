import { Router, Response } from 'express';
import passport from 'passport';
import { generateToken, AuthRequest } from '../middlewares/auth.js';

const router = Router();

// Start Google OAuth login
router.get('/', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

// Google OAuth callback
router.get('/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: true
  }),
  (req: AuthRequest, res: Response) => {
    // Generate JWT token for the user
    const user = req.user as any;
    const token = generateToken(user._id || user.id);

    // Redirect to frontend login page with token
    const frontendUrl = process.env.FRONTEND_URL || 'https://ai.gladsw.cloud';
    res.redirect(`${frontendUrl}/login?token=${token}`);
  }
);

// Logout
router.get('/logout', (req: AuthRequest, res: Response) => {
  const passportReq = req as any;
  if (passportReq.logout) {
    passportReq.logout(() => {
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});

export default router;
