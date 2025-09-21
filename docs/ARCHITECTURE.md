# Genesis Luminal - Arquitetura

## Estrutura do Projeto

```
genesis-luminal/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Node.js + Express + TypeScript  
├── shared/            # Tipos compartilhados
└── docs/             # Documentação

## Fluxo de Dados

Frontend → Backend → Claude API → Backend → Frontend

## Deploy

- Frontend: Vercel/Netlify
- Backend: Railway/Render
- Cache: Redis (Railway addon)

## Desenvolvimento

```bash
# Instalar dependências
npm run install:all

# Desenvolvimento (ambos serviços)
npm run dev

# Build para produção
npm run build
```

