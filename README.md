# OpsPilot

> Production-oriented incident management and AI-assisted troubleshooting platform built with NestJS, PostgreSQL, RabbitMQ, pgvector, and RAG.

OpsPilot is a backend-focused engineering project designed to demonstrate how a modern production system can process incidents asynchronously, reliably deliver events through RabbitMQ, maintain an outbox for reliable event publishing, prevent duplicate message processing, retry failed messages, route permanently failed messages to a Dead Letter Queue (DLQ), and use Retrieval-Augmented Generation (RAG) to provide contextual information to an AI model for incident analysis.

The project is intentionally designed around real backend and distributed-system patterns rather than simply implementing CRUD APIs.

---

## Table of Contents

- [Overview](#overview)
- [Goals](#goals)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Core Request Flow](#core-request-flow)
- [Incident Processing](#incident-processing)
- [Outbox Pattern](#outbox-pattern)
- [RabbitMQ Architecture](#rabbitmq-architecture)
- [Retry and DLQ](#retry-and-dlq)
- [Idempotency](#idempotency)
- [Knowledge and RAG](#knowledge-and-rag)
- [Embedding Providers](#embedding-providers)
- [AI Incident Analysis](#ai-incident-analysis)
- [LLM Providers](#llm-providers)
- [Authentication and Authorization](#authentication-and-authorization)
- [Database](#database)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Testing Without OpenAI Credits](#testing-without-openai-credits)
- [Testing RabbitMQ](#testing-rabbitmq)
- [Reliability Design](#reliability-design)
- [Production Considerations](#production-considerations)
- [Why This Project Is Useful for DevOps/Backend Interviews](#why-this-project-is-useful-for-devopsbackend-interviews)
- [Future Improvements](#future-improvements)
- [License](#license)

---

# Overview

OpsPilot is an incident-management backend that combines traditional backend engineering with asynchronous messaging and AI-assisted troubleshooting.

The system allows incidents to be created and processed asynchronously. Operational knowledge such as runbooks and troubleshooting documentation can be ingested into PostgreSQL using pgvector.

When an incident is processed, the system can retrieve relevant knowledge from the vector database and provide that context to an LLM.

The resulting AI analysis is stored against the incident.

The project demonstrates several important production engineering concepts:

- REST APIs
- NestJS architecture
- PostgreSQL
- Prisma ORM
- RabbitMQ
- Topic exchanges
- Dead Letter Exchanges
- Retry queues
- Message acknowledgements
- Publisher confirms
- Outbox pattern
- Idempotent consumers
- Processing leases
- RAG
- Vector similarity search
- LLM abstraction
- Authentication
- Authorization
- Health checks
- Graceful shutdown

---

# Goals

The main goals of OpsPilot are:

1. Build a realistic backend system rather than a simple CRUD application.
2. Demonstrate reliable asynchronous event processing.
3. Demonstrate RabbitMQ production patterns.
4. Demonstrate the Outbox Pattern.
5. Demonstrate idempotent message consumers.
6. Demonstrate retry and DLQ handling.
7. Implement RAG using PostgreSQL and pgvector.
8. Integrate AI-assisted incident analysis.
9. Keep AI and embedding providers replaceable through abstractions.
10. Allow development and testing without requiring paid AI APIs.

---

# Key Features

## Incident Management

- Create incidents
- Retrieve incidents
- Filter incidents
- Pagination
- Incident severity
- Incident status
- Service identification
- Incident processing through RabbitMQ

## Authentication

- User authentication
- JWT-based authentication
- Authorization
- Role-based access control

## RabbitMQ

- Shared topic exchange
- Durable queues
- Durable messages
- Publisher confirms
- Manual acknowledgements
- Retry queues
- Dead Letter Exchange
- Dead Letter Queues
- Retry count tracking
- Idempotent consumers
- Event IDs

## Outbox

- Database-backed event storage
- Reliable event publishing
- Publisher confirmation
- Processing leases
- Recovery of stale processing events

## RAG

- Knowledge document ingestion
- Text chunking
- Embedding generation
- pgvector storage
- Cosine similarity search
- Context generation
- Knowledge deletion

## AI

- RAG-powered incident analysis
- Structured AI response
- Summary
- Possible cause
- Impact
- Recommended actions
- Confidence score
- Database persistence

## Development/Test Providers

The project includes:

- Fake Embedding Provider
- OpenAI Embedding Provider
- Fake LLM Provider
- OpenAI LLM Provider

This allows the entire RAG/AI pipeline to be tested locally without OpenAI API credits.

---

# Architecture

High-level architecture:

```text
                         ┌─────────────────────┐
                         │      Client         │
                         │  Postman / Frontend │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     NestJS API      │
                         └──────────┬──────────┘
                                    │
                ┌───────────────────┴──────────────────┐
                │                                      │
                ▼                                      ▼
        ┌───────────────┐                     ┌────────────────┐
        │ Incident API  │                     │    RAG API     │
        └───────┬───────┘                     └───────┬────────┘
                │                                     │
                ▼                                     ▼
        ┌────────────────────────────────────────────────────┐
        │                    PostgreSQL                       │
        │                                                    │
        │ Incidents | Users | Outbox | Processed Messages   │
        │ Knowledge Chunks | AI Analysis                    │
        └────────────────────────────────────────────────────┘
                │                                     │
                │                                     │
                ▼                                     ▼
        ┌────────────────┐                    ┌────────────────┐
        │ Outbox Events  │                    │  pgvector     │
        └───────┬────────┘                    └────────────────┘
                │
                ▼
        ┌───────────────────────┐
        │      OutboxPublisher  │
        └───────────┬───────────┘
                    │
                    ▼
        ┌─────────────────────────────┐
        │          RabbitMQ           │
        │                             │
        │     opspilot_events         │
        │     opspilot_dlx            │
        └─────────────┬───────────────┘
                      │
             ┌────────┴─────────┐
             │                  │
             ▼                  ▼
     Incident Worker      Knowledge Worker
             │                  │
             ▼                  ▼
       AI Service          RAG Service
             │                  │
             └────────┬─────────┘
                      ▼
                  LLM Provider
```

---

# Technology Stack

## Backend

- Node.js
- NestJS
- TypeScript

## Database

- PostgreSQL
- Prisma
- pgvector

## Messaging

- RabbitMQ
- AMQP

## AI

- OpenAI
- RAG
- Vector embeddings
- LLM abstraction

## Development

- Docker
- Git
- Postman
- RabbitMQ Management UI

---

# Project Structure

A simplified structure:

```text
src/
│
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── guards/
│
├── incidents/
│   ├── incident.controller.ts
│   ├── incident.service.ts
│   ├── dto/
│   └── incident.worker.ts
│
├── rabbitmq/
│   ├── rabbitmq.module.ts
│   ├── rabbitmq.service.ts
│   ├── rabbitmq.constants.ts
│   ├── rabbitmq-topology.service.ts
│   ├── outbox.service.ts
│   ├── outbox.publisher.ts
│   └── rabbitmq.types.ts
│
├── rag/
│   ├── rag.module.ts
│   ├── rag.controller.ts
│   ├── rag.service.ts
│   ├── rag.types.ts
│   ├── rag-context.service.ts
│   ├── chunker.service.ts
│   ├── vector-store.service.ts
│   ├── embedding.provider.ts
│   ├── embedding.tokens.ts
│   ├── knowledge.worker.ts
│   │
│   └── providers/
│       ├── openai-embedding.provider.ts
│       └── fake-embedding.provider.ts
│
├── ai/
│   ├── ai.service.ts
│   ├── ai.types.ts
│   ├── ai-prompt.service.ts
│   ├── ai-response.parser.ts
│   ├── llm.provider.ts
│   ├── llm.tokens.ts
│   │
│   └── providers/
│       ├── openai-llm.provider.ts
│       └── fake-llm.provider.ts
│
├── prisma/
│   └── prisma.service.ts
│
└── health/
    └── health.controller.ts
```

---

# Core Request Flow

A simplified incident flow:

```text
POST /incidents
       │
       ▼
NestJS Controller
       │
       ▼
Incident Service
       │
       ├──────────────► PostgreSQL
       │
       └──────────────► OutboxEvent
                              │
                              ▼
                       OutboxPublisher
                              │
                              ▼
                         RabbitMQ
                              │
                              ▼
                       Incident Worker
                              │
                              ▼
                         AI Service
                              │
                              ▼
                           RAG
                              │
                              ▼
                         LLM Provider
                              │
                              ▼
                     IncidentAIAnalysis
```

---

# Incident Processing

Incidents are stored in PostgreSQL.

The application also creates an OutboxEvent describing the event.

For example:

```json
{
  "eventType": "incident.created",
  "aggregateId": "incident-id",
  "payload": {
    "incidentId": "incident-id",
    "service": "mongodb",
    "severity": "critical",
    "message": "Database connection timeout"
  }
}
```

The OutboxPublisher later publishes the event to RabbitMQ.

The worker receives the event and processes it asynchronously.

---

# Outbox Pattern

A common distributed-system problem is:

```text
Save database record
       +
Publish RabbitMQ message
```

If the database succeeds but RabbitMQ fails, the system can become inconsistent.

OpsPilot uses the Outbox Pattern.

Instead of directly publishing the event during the request:

```text
API
 │
 ├── Save Incident
 │
 └── Publish RabbitMQ
```

the system stores the event in the same database:

```text
Database Transaction

Incident
   +
OutboxEvent
```

Then a background publisher reads unpublished events:

```text
OutboxEvent
    │
    ▼
OutboxPublisher
    │
    ▼
RabbitMQ
```

This provides reliable event publishing.

---

# Outbox Publisher

The publisher periodically searches for:

```text
published = false
```

events.

It claims events using a processing state.

The project also uses a processing lease.

This protects against a publisher process crashing while processing an event.

A stale processing event can eventually become eligible for processing again.

The publisher also waits for RabbitMQ publisher confirmation before marking an event as published.

---

# RabbitMQ Architecture

OpsPilot uses a shared events exchange:

```text
opspilot_events
```

Exchange type:

```text
topic
```

A separate Dead Letter Exchange is used:

```text
opspilot_dlx
```

Exchange type:

```text
direct
```

Current queues include:

```text
opspilot_incident
opspilot_incident_retry
opspilot_incident_dlq

opspilot_knowledge
opspilot_knowledge_retry
opspilot_knowledge_dlq
```

---

# Routing Keys

Incident events:

```text
incident.created
incident.updated
incident.resolved
incident.dlq
```

Knowledge events:

```text
knowledge.ingest
knowledge.dlq
```

The shared topic exchange allows additional event types and consumers to be added later without creating a separate exchange for every feature.

---

# Retry and DLQ

Failed messages are not immediately lost.

The retry flow is:

```text
Worker
  │
  │ failure
  ▼
Retry Queue
  │
  │ 5 second TTL
  ▼
opspilot_events
  │
  │ original routing key
  ▼
Worker
```

The system tracks retries using:

```text
x-retry-count
```

Maximum attempts:

```text
3
```

After the retry limit:

```text
Worker
   │
   ▼
opspilot_dlx
   │
   ▼
knowledge.dlq / incident.dlq
```

This gives failed messages a controlled failure path instead of endlessly retrying.

---

# Message Acknowledgements

Workers use manual acknowledgements.

Successful processing:

```text
ACK
```

For retry:

```text
Publish retry message
        ↓
ACK original
```

For DLQ:

```text
Publish to DLX
        ↓
ACK original
```

The original message is acknowledged only after the replacement retry/DLQ message has been successfully published.

---

# Idempotency

RabbitMQ provides at-least-once delivery semantics.

That means duplicate delivery can happen.

OpsPilot therefore uses an idempotency table:

```text
ProcessedMessage
```

with a unique:

```text
messageKey
```

The Outbox event ID is used as the message key.

Example:

```text
eventId:
39b8c30c-9f00-4aa8-a8c6-0d4cc4fa2a66
```

Before processing:

```text
ProcessedMessage.findUnique(eventId)
```

If the event was already processed:

```text
Duplicate event detected
       ↓
ACK
```

The actual ingestion/processing is skipped.

The database unique constraint provides an additional safety layer against concurrent duplicate processing.

---

# Knowledge and RAG

OpsPilot contains a knowledge ingestion pipeline.

Knowledge can include:

- Troubleshooting runbooks
- Database documentation
- Infrastructure documentation
- Operational procedures
- Incident resolution guides

The ingestion flow is:

```text
POST /rag/ingest
       │
       ▼
OutboxEvent
       │
       ▼
OutboxPublisher
       │
       ▼
RabbitMQ
       │
       ▼
KnowledgeWorker
       │
       ▼
RagService
       │
       ├── Chunk document
       │
       ├── Generate embeddings
       │
       └── Store vectors
```

The HTTP request therefore does not perform the potentially expensive embedding and vector-storage work synchronously.

---

# Document Chunking

Documents are divided into smaller chunks before embedding.

Current development configuration:

```text
Chunk size: 500
Overlap:    50
```

The overlap helps preserve context between neighboring chunks.

Example:

```text
Document
   │
   ├── Chunk 0
   ├── Chunk 1
   ├── Chunk 2
   └── Chunk 3
```

---

# Vector Database

PostgreSQL with pgvector is used for vector storage.

Knowledge chunks contain:

```text
id
content
source
metadata
embedding
createdAt
```

The embedding column uses:

```text
vector(1536)
```

The project uses cosine similarity for vector search.

A similarity threshold is used to avoid returning completely unrelated knowledge.

---

# RAG Retrieval

When an incident needs AI analysis:

```text
Incident
   │
   ▼
Create query
   │
   ▼
Generate query embedding
   │
   ▼
pgvector similarity search
   │
   ▼
Relevant knowledge chunks
   │
   ▼
Build RAG context
   │
   ▼
LLM
```

The LLM therefore receives both the incident information and relevant operational knowledge.

---

# Embedding Providers

The embedding system uses an abstraction:

```ts
interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
}
```

This prevents the RAG system from being tightly coupled to one embedding vendor.

## OpenAI Embedding Provider

The project includes an OpenAI implementation using:

```text
text-embedding-3-small
```

This provider is intended for real semantic embeddings.

---

# Fake Embedding Provider

The project also includes:

```text
FakeEmbeddingProvider
```

This provider is specifically for development and testing.

It generates deterministic 1536-dimensional vectors without making external API calls.

This allows developers to test:

```text
Document
   ↓
Chunking
   ↓
Embedding
   ↓
pgvector
   ↓
Similarity search
```

without requiring OpenAI API credits.

### Important

The Fake Embedding Provider is **not intended for production semantic search**.

Its purpose is:

- Local development
- Integration testing
- RabbitMQ testing
- Database testing
- RAG pipeline testing
- CI environments without API credentials

For real semantic retrieval, use the OpenAI embedding provider or another production embedding provider.

---

# AI Incident Analysis

After an incident is processed, OpsPilot can perform AI-assisted analysis.

The AI pipeline is:

```text
Incident
   │
   ▼
RAG Retrieval
   │
   ▼
Relevant Knowledge
   │
   ▼
Prompt Construction
   │
   ▼
LLM
   │
   ▼
JSON Response
   │
   ▼
Response Parser
   │
   ▼
Database
```

The generated analysis contains:

```text
summary
possibleCause
impact
recommendedActions
confidence
```

---

# RAG Context

The system builds a limited context from retrieved knowledge.

The context contains information such as:

```text
Source
Similarity
Content
```

The context is then included in the AI prompt.

The purpose of RAG is to ground the AI response in the organization's operational knowledge rather than asking the LLM to answer solely from its general training.

---

# LLM Providers

The LLM system is also abstracted behind a provider interface.

This means the AI service does not need to know which LLM vendor is being used.

---

# OpenAI LLM Provider

The project includes an OpenAI provider using:

```text
gpt-5-mini
```

It is responsible for generating structured incident analysis.

The expected response contains:

```json
{
  "summary": "...",
  "possibleCause": "...",
  "impact": "...",
  "recommendedActions": [],
  "confidence": 0.85
}
```

---

# Fake LLM Provider

The project also includes:

```text
FakeLLMProvider
```

This is extremely useful for development and testing.

It allows the complete AI pipeline to run without OpenAI credits:

```text
Incident
   ↓
RAG Retrieval
   ↓
Prompt
   ↓
FakeLLMProvider
   ↓
Response Parser
   ↓
IncidentAIAnalysis
```

The Fake LLM provider returns deterministic structured data suitable for testing.

It allows developers to verify:

- AI service logic
- Prompt generation
- RAG integration
- Response parsing
- Database persistence
- Error handling
- End-to-end incident processing

without making an external LLM API request.

### Important

The Fake LLM Provider is a **testing/development provider**, not a production AI model.

For actual AI-generated incident analysis, configure the OpenAI provider.

---

# Authentication and Authorization

OpsPilot includes authentication and authorization.

The authentication flow uses JWT.

The system also maps authenticated users to roles.

Authorization can then be applied to protected operations.

This demonstrates the separation between:

```text
Authentication
Who are you?
```

and:

```text
Authorization
What are you allowed to do?
```

---

# Database

PostgreSQL is the primary database.

Important entities include:

```text
User
Incident
OutboxEvent
ProcessedMessage
KnowledgeChunk
IncidentAIAnalysis
```

---

# OutboxEvent

The OutboxEvent contains:

```text
id
eventType
aggregateId
payload
published
processing
processingAt
createdAt
publishedAt
```

It tracks the lifecycle of an event from creation through RabbitMQ publication.

---

# ProcessedMessage

The ProcessedMessage table provides idempotency.

Important fields:

```text
id
messageKey
processedAt
```

`messageKey` is unique.

---

# KnowledgeChunk

Knowledge chunks store:

```text
id
content
source
metadata
embedding
createdAt
```

The embedding is stored using pgvector.

---

# IncidentAIAnalysis

AI results are stored separately from the incident itself.

Fields include:

```text
incidentId
summary
possibleCause
impact
recommendedActions
confidence
createdAt
```

This keeps AI analysis separated from the core incident entity.

---

# API Endpoints

## Incidents

Typical incident endpoints include:

```text
POST   /incidents
GET    /incidents
```

The incident listing supports filtering and pagination.

Example:

```text
GET /incidents?severity=critical
```

---

## RAG

### Ingest knowledge

```text
POST /rag/ingest
```

Example:

```json
{
  "id": "mongodb-runbook-001",
  "content": "MongoDB connection timeout troubleshooting...",
  "source": "mongodb-runbook",
  "metadata": {
    "service": "mongodb",
    "category": "database"
  }
}
```

The endpoint queues the ingestion through the Outbox/RabbitMQ pipeline.

Response:

```json
{
  "message": "Knowledge ingestion queued successfully",
  "documentId": "mongodb-runbook-001"
}
```

---

### Search knowledge

```text
POST /rag/search
```

Example:

```json
{
  "query": "MongoDB connection timeout",
  "limit": 5
}
```

The service generates an embedding and performs vector similarity search.

---

### Delete knowledge

```text
DELETE /rag/:documentId
```

This removes the document's stored chunks.

---

# Environment Variables

A typical environment configuration contains values similar to:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/opspilot

RABBITMQ_URL=amqp://guest:guest@localhost:5672

JWT_SECRET=your-secret

OPENAI_API_KEY=your-openai-api-key
```

The exact configuration should be adjusted for the local environment.

---

# Running the Project

## 1. Clone the repository

```bash
git clone <repository-url>
cd opspilot
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Start PostgreSQL

The project uses PostgreSQL with pgvector.

For example, through Docker:

```bash
docker compose up -d
```

Verify the database container is running.

---

## 4. Start RabbitMQ

RabbitMQ should be available at:

```text
amqp://guest:guest@localhost:5672
```

The RabbitMQ Management UI is typically available on:

```text
http://localhost:15672
```

Default development credentials are commonly:

```text
guest / guest
```

depending on the local RabbitMQ configuration.

---

## 5. Run Prisma migrations

Run the project's configured Prisma migration workflow.

For example:

```bash
npx prisma migrate dev
```

The project includes a migration that enables pgvector:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 6. Generate Prisma Client

```bash
npx prisma generate
```

---

## 7. Start NestJS

Development:

```bash
npm run start:dev
```

Production build:

```bash
npm run build
npm run start:prod
```

---

# Testing Without OpenAI Credits

One of the important design decisions in OpsPilot is that external AI services are abstracted.

You can run the complete pipeline with:

```text
FakeEmbeddingProvider
+
FakeLLMProvider
```

without an OpenAI API key.

Development architecture:

```text
Incident
   │
   ▼
RAG
   │
   ▼
FakeEmbeddingProvider
   │
   ▼
pgvector
   │
   ▼
RAG Context
   │
   ▼
FakeLLMProvider
   │
   ▼
IncidentAIAnalysis
```

This is useful for:

- Development
- Automated tests
- CI/CD
- Local debugging
- RabbitMQ testing
- Database testing
- Demonstrating the architecture without API costs

For production AI behavior, replace the fake providers with the OpenAI implementations.

---

# Testing RabbitMQ

RabbitMQ can be inspected through the Management UI.

Important exchange:

```text
opspilot_events
```

Important queues:

```text
opspilot_incident
opspilot_incident_retry
opspilot_incident_dlq

opspilot_knowledge
opspilot_knowledge_retry
opspilot_knowledge_dlq
```

---

# Testing Knowledge Ingestion

Send:

```http
POST /rag/ingest
```

Example:

```json
{
  "id": "test-001",
  "content": "Redis connection failures can occur when the Redis server is unavailable.",
  "source": "redis-runbook",
  "metadata": {
    "service": "redis"
  }
}
```

Expected flow:

```text
HTTP request
    ↓
OutboxEvent
    ↓
OutboxPublisher
    ↓
opspilot_events
    ↓
knowledge.ingest
    ↓
opspilot_knowledge
    ↓
KnowledgeWorker
    ↓
RagService
    ↓
KnowledgeChunk
```

---

# Testing Idempotency

The OutboxPublisher adds:

```text
eventId
```

to RabbitMQ headers.

If the same event is delivered again:

```text
eventId
    ↓
ProcessedMessage
    ↓
Already exists
    ↓
Duplicate detected
    ↓
ACK
```

The actual ingestion is not repeated.

---

# Testing Retry

The KnowledgeWorker can retry failed processing.

Current retry configuration:

```text
Maximum attempts: 3
Retry delay:      5 seconds
```

The retry header is:

```text
x-retry-count
```

Example:

```text
Retry: 1
Retry: 2
Retry: 3
```

After the configured limit, the event is moved to the Knowledge DLQ.

---

# Testing DLQ

A permanently failing message follows:

```text
KnowledgeWorker
      ↓
Failure
      ↓
Retry 1
      ↓
Retry 2
      ↓
Retry 3
      ↓
Knowledge DLQ
```

This allows failed messages to be inspected and manually recovered instead of silently disappearing.

---

# Reliability Design

OpsPilot intentionally demonstrates several distributed-system reliability patterns.

## 1. Durable Messages

Messages are published as persistent messages.

---

## 2. Durable Queues

Queues are declared durable.

---

## 3. Publisher Confirms

The publisher waits for RabbitMQ confirmation before considering the message successfully published.

---

## 4. Manual ACK

Workers manually acknowledge messages after successful processing.

---

## 5. Retry Queue

Temporary failures are retried after a delay.

---

## 6. DLQ

Messages that cannot be successfully processed after the configured retry attempts are moved to a DLQ.

---

## 7. Idempotency

Duplicate events are detected through `ProcessedMessage`.

---

## 8. Outbox

Database state and pending events are persisted together before asynchronous publication.

---

## 9. Processing Lease

The OutboxPublisher tracks processing state and can recover stale events after a lease expires.

---

## 10. Graceful Shutdown

The application closes its RabbitMQ connections during shutdown.

---

# Production Considerations

The project is designed to demonstrate production-oriented patterns, but additional work would still be required before operating it as a large-scale production platform.

Possible production improvements include:

- Distributed worker deployment
- Kubernetes deployment
- RabbitMQ clustering
- PostgreSQL high availability
- Centralized logging
- Metrics
- Distributed tracing
- OpenTelemetry
- Alerting
- Secrets management
- Rate limiting
- API gateway
- Automated database backups
- Automated DLQ replay tooling
- Schema/event versioning
- Advanced vector-search optimization
- Horizontal worker scaling

These are intentionally outside the current project scope.

---

# Future Improvements

Possible future extensions include:

```text
Notification Service
Audit Service
AI Analysis Queue
Automated DLQ Replay
```

The current architecture intentionally keeps these outside the initial scope.

---

# Project Status

## Completed

- [x] NestJS backend
- [x] Authentication
- [x] Authorization
- [x] Incident management
- [x] PostgreSQL
- [x] Prisma
- [x] RabbitMQ
- [x] Topic exchange
- [x] Outbox Pattern
- [x] Outbox publisher
- [x] Publisher confirms
- [x] Processing lease
- [x] Idempotent consumers
- [x] Retry queues
- [x] Dead Letter Queues
- [x] Knowledge ingestion
- [x] pgvector
- [x] Embedding abstraction
- [x] OpenAI embedding provider
- [x] Fake embedding provider
- [x] RAG retrieval
- [x] RAG context generation
- [x] AI incident analysis
- [x] OpenAI LLM provider
- [x] Fake LLM provider
- [x] Structured AI response parsing
- [x] AI analysis persistence
- [x] Health check
- [x] Graceful shutdown

---

# License

This project is intended as a portfolio and learning project.
