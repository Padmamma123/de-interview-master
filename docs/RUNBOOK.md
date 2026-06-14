# Runbook

## Local Development

1. Set environment variables:
   - `OPENAI_API_KEY`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
2. Start the full stack:
   - `docker compose up --build`
3. Access:
   - Frontend: `http://localhost:5173`
   - Backend Swagger: `http://localhost:8080/swagger`
   - AI Service Docs: `http://localhost:8001/docs`

## Troubleshooting

- If API cannot connect DB, verify `ConnectionStrings__DefaultConnection`.
- If no AI answer appears, verify `OPENAI_API_KEY` and AI service health endpoint.
- If chat quality is weak, upload more docs through `/ingest-pdf`.

## Production Hardening Checklist

- Move secrets to Azure Key Vault
- Enable HTTPS and strict CORS
- Add rate limiting and request throttling
- Add observability (OpenTelemetry + App Insights)
- Add background worker for heavy ingestion jobs
- Add robust PDF parsing (instead of fallback decode)

