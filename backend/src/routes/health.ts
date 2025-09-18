import { Router } from 'express';
import { config } from '../config/environment';

const router = Router();

// Liveness probe - basic health check
router.get('/liveness', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    service: 'Genesis Luminal Claude'
  });
});

// Readiness probe - detailed health check
router.get('/readiness', (req, res) => {
  const isReady = !!config.CLAUDE_API_KEY;
  
  res.json({
    status: isReady ? 'ready' : 'not_ready',
    ready: isReady,
    timestamp: new Date().toISOString(),
    checks: {
      claude_api_key: config.CLAUDE_API_KEY ? 'configured' : 'missing'
    }
  });
});

// Detailed status endpoint
router.get('/status', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'ok',
    service: 'Genesis Luminal Claude',
    version: '1.0.0',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    uptime_seconds: Math.floor(process.uptime()),
    memory_mb: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024)
    },
    claude_api_key: config.CLAUDE_API_KEY ? 'configured' : 'missing'
  });
});

export default router;
