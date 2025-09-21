#!/bin/bash
echo "🔧 Corrigindo configuração Jest..."

# Backup do package.json atual
cp package.json package.json.backup

# Remover configuração Jest do package.json (manter apenas scripts e dependências)
cat > package.json << 'EOF'
{
  "name": "genesis-luminal-backend",
  "version": "1.0.0",
  "description": "Backend para Genesis Luminal com integração Claude API",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:unit": "jest src/__tests__/basic.test.js",
    "test:integration": "jest src/__tests__/integration/",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --reporters=default --reporters=jest-junit",
    "test:verbose": "jest --verbose",
    "lint": "eslint src/**/*.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@types/compression": "^1.8.1",
    "compression": "^1.8.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "rate-limiter-flexible": "^2.4.2",
    "redis": "^4.6.10",
    "winston": "^3.11.0",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.8",
    "@types/node": "^20.10.0",
    "@types/supertest": "^6.0.2",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "eslint": "^8.55.0",
    "jest": "^29.7.0",
    "jest-junit": "^16.0.0",
    "supertest": "^6.3.3",
    "tsx": "^4.6.0",
    "typescript": "^5.3.2"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": ["genesis", "luminal", "emotional-ai", "claude"],
  "author": "Genesis Luminal Team",
  "license": "MIT"
}
EOF

# Atualizar jest.config.js
cp jest.config.js jest.config.js.backup
cat > jest.config.js << 'EOF'
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.{js,ts}',
    '**/?(*.)+(spec|test).{js,ts}'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/src/$1'
  },
  transform: {},
  testTimeout: 30000
}
EOF

echo "✅ Configuração Jest corrigida"
echo "📦 Instalando ts-jest se necessário..."

# Verificar e instalar ts-jest
npm list ts-jest || npm install --save-dev ts-jest

echo "🧪 Testando configuração..."
npm run test:unit

echo "🎉 Correção concluída!"

------------------------------------------------------------------------------------------------------------------------