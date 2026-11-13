import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import shipmentRoutes from './routes/shipmentRoutes.js';
import containerRoutes from './routes/containerRoutes.js';
import vesselRoutes from './routes/vesselRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import calculatorRoutes from './routes/calculatorRoutes.js';
import crmRoutes from './routes/crmRoutes.js';
import systemRoutes from './routes/systemRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security & Parsing Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets / uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get(['/api/health', '/health', '/'], (req, res) => {
  res.json({
    status: 'ONLINE',
    company: 'HANSAI SHIPPING LINE',
    system: 'Integrated Shipping, Container & Vessel Management Platform',
    version: '1.0.0',
    timestamp: new Date(),
  });
});

// Helper to mount module routes (supports both /api prefix and direct mounting)
const mountRoutes = (prefix = '') => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/dashboard`, dashboardRoutes);
  app.use(`${prefix}/shipments`, shipmentRoutes);
  app.use(`${prefix}/containers`, containerRoutes);
  app.use(`${prefix}/vessels`, vesselRoutes);
  app.use(`${prefix}/finance`, financeRoutes);
  app.use(`${prefix}/calculators`, calculatorRoutes);
  app.use(`${prefix}/crm`, crmRoutes);
  app.use(`${prefix}/system`, systemRoutes);
};

mountRoutes('/api');
mountRoutes('');

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred',
  });
});

export default app;
