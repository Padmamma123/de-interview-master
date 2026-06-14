# Data Engineer Interview Master

AI-powered interview preparation platform for Data Engineering roles (Beginner to Architect).

## Architecture

- `frontend/`: React + TypeScript + Material UI client application
- `backend/`: .NET 9 Web API using Clean Architecture layers
- `ai-rag-service/`: FastAPI + LangChain + ChromaDB microservice
- `database/`: PostgreSQL schema and seed scripts
- `infra/`: Docker and deployment assets
- `.github/workflows/`: CI/CD pipelines

## Core Features

- JWT + Google OAuth login
- Dynamic AI interview question generation by experience, topic, difficulty, and type
- RAG chat assistant for technical interview prep
- Mock interview mode with adaptive follow-up and scoring
- Learning path generator with skill gap analysis
- Admin panel APIs for prompts, users, and knowledge base
- Analytics dashboard APIs (streaks, score trends, weak/strong topics)

## Quick Start

1. Copy environment templates:
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env`
   - `cp ai-rag-service/.env.example ai-rag-service/.env`
2. Start all services:
   - `docker compose up --build`
3. Open:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8080/swagger`
   - RAG Service: `http://localhost:8001/docs`

## Production Notes

- Configure secure secrets in Azure Key Vault.
- Use managed PostgreSQL and Container Apps / AKS for scale.
- Enable OpenTelemetry for traces and metrics.
- Add Redis cache for high-throughput prompt and retrieval workflows.

