import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import prisma, { connectDB } from './config/db.js';
import authRouter from './routes/authRoutes.js';
import propertyRouter from './routes/propertyRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import favoriteRouter from './routes/favoriteRoutes.js';
import inquiryRouter from './routes/contactInquiryRoutes.js';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: nodeEnv });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/properties', propertyRouter);
app.use('/api/favorites', favoriteRouter);
app.use('/api/inquiries', inquiryRouter);


app.use( (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot find ${req.originalUrl} on this server!`,
  });
});

app.use(errorHandler);

let server;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`Server running in ${nodeEnv} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database or start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Gracefully shutting down server...');
  if (server) {
    server.close(() => {
      console.log('Process terminated.');
    });
  }
});

