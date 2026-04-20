import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';

// Routes
import authRoutes from './routes/auth.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import roleApplicationRoutes from './routes/roleApplication.routes.js';
import diagnosticRoutes from './routes/diagnostic.routes.js';
import medicationRoutes from './routes/medication.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import medicalRecordRoutes from './routes/medicalRecord.routes.js';
import availabilityRoutes from './routes/availability.routes.js';
import settingsRoutes from './routes/settings.routes.js';
// import userRoutes from './routes/userRoutes.js'; // Legacy - to be refactored

// Middlewares
import authMiddleware from './middlewares/auth.middleware.js';

// Config
import env from './config/env.js';

/**
 * Express Application Configuration
 */
const app = express();

// File upload configuration
const upload = multer({ storage: multer.memoryStorage() });

// ==================== MIDDLEWARE ====================

// CORS configuration
// const devOrigins = [
//   'http://localhost:3000',
//   'http://localhost:5173',
//   'http://localhost:5174',
//   'http://localhost:5175',
//   'https://mediconnect-h298.onrender.com'
// ];
// const allowedOrigins = new Set([
//   env.FRONTEND_URL,
//   ...devOrigins,
// ].filter(Boolean));

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.has(origin)) return callback(null, true);
//     if (env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) {
//       return callback(null, true);
//     }
//     return callback(new Error('Not allowed by CORS'));
//   },
//   credentials: true,
// }));
app.use(cors({
  origin: true,
  credentials: true,
}));


// Request logging (development only)
if (env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ==================== ROUTES ====================

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    name: env.APP_NAME,
    version: env.APP_VERSION,
    environment: env.NODE_ENV,
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Appointment routes
app.use('/api/appointments', appointmentRoutes);

// Role application routes
app.use('/api/role-applications', roleApplicationRoutes);

// Diagnostic test routes
app.use('/api/diagnostics', diagnosticRoutes);

// Medication and reminder routes
app.use('/api/medications', medicationRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// Medical record routes
app.use('/api/medical-records', medicalRecordRoutes);

// Availability routes
app.use('/api/availability', availabilityRoutes);

// Hospital settings routes (admin)
app.use('/api/settings', settingsRoutes);

// Protected routes example (with file upload support)
// app.use('/api/users', authMiddleware, upload.single('image'), userRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;