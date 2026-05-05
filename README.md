# OpenATS

## About 

> Open-source ATS powered by AI. Parse CVs, score candidates, and manage job postings — self-hostable and free.

### Architecture and design decisions
OpenATS follows Domain-Driven Design with a ports and adapters architecture, separating domain, application, infrastructure, and interface layers. Business rules stay independent of any framework or infrastructure detail, making AI providers, database adapters, and queue implementations fully replaceable.

CV processing runs asynchronously via Bull, a choice to avoid HTTP blocking processes and handle long-running processing outside http. You may config concurrency in workers want to process more in the same time

VLM pipeline is planned to support pdf, docx, jpg and png files, but at the moment it only supports pdf files. It converts those files into Base64, since VLMs process it through Base64.

## Features

- **Job postings** - Create and manage job offers with requirements and contact details
- **CV submission** - Candidates can apply by uploading a PDF or a DOCX file resume via a public endpoint.
- **Candidate scoring** - The system generates automatically a score based on Candidate's CV and offer.
- **AI parsing** - CV data is extracted automatically through a VLM.
- **Async processing** - CV submission is handled asynchronously via BullMQ.
- **Authentication** - JWT-based auth with access and refresh tokens, email verification and logout.
- **Multi-provider AI** - Supports Ollama and xAI, configurable through .env.

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Fastify |
| Database | PostgreSQL + Drizzle ORM |
| Queues | BullMQ + Redis |
| AI | Ollama / xAI (via Vercel AI SDK) |

## Roadmap

This project is under active development, here some planned features. I am acknowledged about few bugs, they will be fixed soon.

- [x] RBAC authentication
- [ ] Creation of a Mail service for email verification
- [ ] More files supporting
- [ ] Frontend
- [ ] "Generative" frontend. AI-assisted interfaces
- [ ] More AI models available

## Getting started
### Prerequisites

- Docker & Docker compose.

### Run with Docker

```bash
docker compose up
```

This will start four services, db (Postgres), redis, backend (API on port 6500) and bull (queue worker).

### Environment variables

```.env
API_PORT = 6500

AI_PROVIDER = xai # Set to 'ollama' to use ollama models, 'xai' for XAI's models

VL_MODEL = qwen2.5vl:7b
LLM_MODEL = qwen2.5:7b

XAI_KEY = # Your Xai API-Key.

DB_DRIVER = postgres
DB_USER = root
DB_PASSWORD = root
DB_HOST = 127.0.0.1
DB_PORT = 5440
DATABASE = postgres

SES_SMTP_HOST =
SES_MAIL_PORT = 587
SES_SMTP_USER =
SES_SMTP_PASS =

REDIS_USER = 
REDIS_PASSWORD = 
REDIS_HOST = 127.0.0.1
REDIS_PORT = 6379
REDIS_DB_NUMBER = 0

JWT_SECRET_KEY = <a_secret_key_for_jwt>
COOKIE_SECRET_KEY = <a_secret_key_for_cookies>
```

## Development

**Backend**
```bash
cd backend
npm install
npm run dev
npm run bull
```

- API is testable through Bruno (API client) by opening api-tests folder with it.

## License

GNU AFFERO. Read LICENSE.md for more information.