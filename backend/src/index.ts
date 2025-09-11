/**
 * GENESIS LUMINAL BACKEND
 * Servidor principal com integração Claude API
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/environment';
import { setupRoutes } from './routes';
import { errorMiddleware } from './middleware/error';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { logger } from './utils/logger';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimitMiddleware);

// Routes
app.use('/api', setupRoutes());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'genesis-luminal-backend'
  });
});

// Error handling
app.use(errorMiddleware);

// Start server
const PORT = config.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`🚀 Genesis Luminal Backend running on port ${PORT}`);
  logger.info(`📡 Frontend URL: ${config.FRONTEND_URL}`);
  logger.info(`🧠 Claude API: ${config.CLAUDE_API_KEY ? 'Configured' : 'Missing'}`);
});
