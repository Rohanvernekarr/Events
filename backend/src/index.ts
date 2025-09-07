import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import all your route files
import authRouter from './routes/auth';
import eventsRouter from './routes/events';
import registrationsRouter from './routes/registrations';
import studentsRouter from './routes/students';
import collegesRouter from './routes/colleges';
import attendanceRouter from './routes/attendance';
import feedbackRouter from './routes/feedback';
import reportsRouter from './routes/reports';

dotenv.config();

const app = express();

// Configure CORS to allow mobile app requests
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:8081', // Expo dev server
      'http://localhost:19006', // Expo web
      'http://localhost:3000',  // Admin portal
      'http://localhost:3001',  // Backend API
      'exp://localhost:19000',  // Expo mobile
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    return callback(null, true); // Allow all origins in development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());

// Test route to verify server is working
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Campus Event Management API is running' });
});

// Mount ALL routes with /api prefix
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/registrations', registrationsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/colleges', collegesRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/reports', reportsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET  /api/colleges');
  console.log('- POST /api/auth/admin/login');
  console.log('- GET  /api/events');
});
