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
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    company: 'HANSAI SHIPPING LINE',
    system: 'Integrated Shipping, Container & Vessel Management Platform',
    version: '1.0.0',
    timestamp: new Date(),
  });
});

// Mount Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/containers', containerRoutes);
app.use('/api/vessels', vesselRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/calculators', calculatorRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/system', systemRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred',
  });
});

export default app;
