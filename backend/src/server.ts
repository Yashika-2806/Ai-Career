import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth.routes.js';
import dsaRoutes from './routes/dsa.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import researchRoutes from './routes/research.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import roadmapRoutes from './routes/roadmap.routes.js';
import pdfRoutes from './routes/pdf.routes.js';
import googleRoutes from './routes/google.routes.js';

import session from 'express-session';
import passport from 'passport';
import '../ai/passport.js';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5001;

// ============================================
// MIDDLEWARE
// ============================================

// Trust proxy - Required for rate limiting behind nginx
app.set('trust proxy', 1);

// CRITICAL: CORS must be wide open for debugging
app.use(cors({
  origin: true, // Allow ALL origins during debugging
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

// CRITICAL: Handle OPTIONS explicitly
app.options('*', (req: Request, res: Response) => {
  console.log('✓ OPTIONS request handled for:', req.path);
  res.status(200).end();
});

// Parse body FIRST
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session and Passport setup (for OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}));
app.use(passport.initialize());
app.use(passport.session());

// THEN log requests (after body is parsed)
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📥 INCOMING REQUEST');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Origin:', req.headers.origin);
  console.log('Content-Type:', req.headers['content-type']);
  const bodyStr = JSON.stringify(req.body);
  console.log('Body:', bodyStr ? bodyStr.substring(0, 200) : 'empty');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  next();
});

// ============================================
// MONGODB CONNECTION (GRACEFUL)
// ============================================
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  MongoDB URI not configured. Running without database.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5001,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error: any) {
    console.warn('⚠️  MongoDB connection failed:', error.message);
    console.warn('⚠️  Server will run without database (read-only mode)');
  }
};

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    data: {
      timestamp: new Date().toISOString(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptime: process.uptime(),
    }
  });
});

// AI Health Check (Test Gemini)
app.get('/health/ai', async (req: Request, res: Response) => {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Say OK in one word');
    const text = result.response.text();
    res.json({ 
      success: true, 
      message: 'Gemini AI is working',
      model: 'gemini-2.5-flash',
      apiVersion: 'v1beta (default)',
      response: text 
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.toString()
    });
  }
});

// ============================================
// API ROUTES
// ============================================

try {
  // Register routes
  app.use('/api/auth', authRoutes);
  app.use('/api/google', googleRoutes);
  console.log('✅ Auth routes loaded');
  
  app.use('/api/dsa', dsaRoutes);
  console.log('✅ DSA routes loaded');
  
  app.use('/api/resume', resumeRoutes);
  console.log('✅ Resume routes loaded');
  
  app.use('/api/research', researchRoutes);
  console.log('✅ Research routes loaded');
  
  app.use('/api/interview', interviewRoutes);
  console.log('✅ Interview routes loaded');
  
  app.use('/api/roadmap', roadmapRoutes);
  console.log('✅ Roadmap routes loaded');
  
  app.use('/api/pdf', pdfRoutes);
  console.log('✅ PDF routes loaded');
  
  console.log('✅ All routes registered successfully');
} catch (error) {
  console.error('❌ Failed to register routes:', error);
}

// ============================================
// ERROR HANDLING
// ============================================
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
    data: null
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    data: null
  });
});

// ============================================
// SERVER STARTUP
// ============================================
const server = app.listen(PORT, async () => {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║                                                       ║');
  console.log('║   🎓 College Career AI - Production Server           ║');
  console.log(`║   📍 Server: http://localhost:${PORT}                  ║`);
  console.log('║   🚀 Status: Running                                  ║');
  console.log('║                                                       ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  // Connect to MongoDB after server starts
  await connectDB();
  
  console.log('✅ All routes loaded successfully');
  console.log('✅ Server ready to accept connections\n');
});

// Keep process alive
setInterval(() => {
  // Heartbeat to prevent process exit
}, 60000);

// Log uptime every 30 seconds
setInterval(() => {
  console.log(`[${new Date().toISOString()}] Server uptime: ${Math.floor(process.uptime())}s`);
}, 30000);

// ============================================
// GRACEFUL SHUTDOWN (COMPLETELY DISABLED)
// ============================================

// Disable all shutdown handlers
process.removeAllListeners('SIGTERM');
process.removeAllListeners('SIGINT');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Don't exit - log and continue
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - log and continue
});

// Log exit events for debugging
process.on('exit', (code) => {
  console.log(`\n💀 Process EXIT event fired with code: ${code}`);
});

process.on('beforeExit', (code) => {
  console.log(`\n⚠️  Process BEFORE EXIT event fired with code: ${code}`);
});

// Prevent process from exiting
process.stdin.resume();

export default app;
