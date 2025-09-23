import { app } from './app';
import { specs, swaggerUi } from './docs/swagger';

const PORT = 3001;

// Adicionar Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Adicionar endpoint emotional/analyze
app.post('/api/emotional/analyze', (req, res) => {
  res.json({
    success: true,
    intensity: 0.8,
    dominantAffect: 'joy',
    confidence: 0.85,
    recommendation: 'Continue explorando sua curiosidade natural',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`Metrics: http://localhost:${PORT}/metrics`);
});
