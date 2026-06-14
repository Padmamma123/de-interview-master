# Architecture Overview

## System Components

- **Frontend (`React + TypeScript + MUI`)**
  - Dashboard, Question Generator, AI Assistant, Authentication views
- **Backend (`.NET 9 Web API`)**
  - Clean Architecture layering:
    - Domain (entities)
    - Application (use-case contracts, services)
    - Infrastructure (EF Core, auth, repository)
    - API (controllers and HTTP endpoints)
- **AI Service (`FastAPI + LangChain + Chroma`)**
  - Dynamic question generation
  - RAG-based assistant responses
  - PDF ingestion/chunking/embedding pipeline
- **Data Layer**
  - PostgreSQL for application state
  - ChromaDB for vector retrieval

## Key API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/questions/generate`
- `POST /api/chat`
- `POST /api/mock-interviews/evaluate-answer`
- `POST /api/learning/plan`
- `GET /api/analytics/dashboard`

## Security

- JWT bearer tokens
- Role-based authorization (`Admin`, `User`)
- Password hashing with BCrypt
- External secret injection expected in production

## RAG Pipeline

1. Upload document to `POST /ingest-pdf`
2. Split text into chunks
3. Generate embeddings (`OpenAIEmbeddings`)
4. Persist vectors in Chroma
5. Retrieve top-k context on chat request
6. Prompt LLM with grounded context and return answer

## Deployment

- Local: `docker compose up --build`
- Cloud: Azure Container Apps / AKS with managed PostgreSQL and secure key management

