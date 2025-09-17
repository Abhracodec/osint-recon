# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is an ethical OSINT (Open Source Intelligence) reconnaissance platform built with a modern TypeScript stack. The application enforces strict ethical guidelines with mandatory consent flows and is designed for authorized security testing only.

## Architecture

### Multi-Service Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS (port 3000)
- **Backend**: Fastify + TypeScript + BullMQ job queue (port 3001) 
- **Worker**: Background job processor for OSINT modules
- **Infrastructure**: Redis (job queue), PostgreSQL (optional persistent storage)

### Key Design Patterns
- **Job Queue Pattern**: All scanning operations run as background jobs via BullMQ
- **Modular OSINT System**: Each reconnaissance technique is implemented as a separate module
- **Ethical-First Design**: Mandatory consent workflow blocks all scanning functionality
- **API Proxy Pattern**: Third-party API keys are never exposed to frontend
- **Docker Sandboxing**: CLI tools run in isolated containers for security

## Common Development Commands

### Quick Start
```bash
# Copy environment template
cp .env.example .env

# Start all services (production-like)
docker-compose up -d

# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up

# Access points:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# API Documentation: http://localhost:3001/docs
```

### Development Workflow
```bash
# Install all dependencies
npm run install:all

# Run tests across all services
npm test

# Lint and format code
npm run lint
npm run format

# Build all services
npm run build

# View logs
docker-compose logs -f
docker-compose logs -f backend  # specific service
```

### Individual Service Development
```bash
# Backend development
cd backend && npm run dev

# Frontend development  
cd frontend && npm run dev

# Worker development
cd worker && npm run dev

# Run specific tests
npm run test:backend
npm run test:frontend
npm run test:worker
```

### Debugging and Maintenance
```bash
# Reset entire environment
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Database operations (when using PostgreSQL)
docker-compose exec backend npm run migrate

# Debug mode with verbose logging
LOG_LEVEL=debug docker-compose up

# Health check
curl http://localhost:3001/api/health
```

## Code Architecture Guidelines

### Backend Structure (`backend/src/`)
- `index.ts` - Main Fastify server setup with all middleware
- `routes/` - API endpoint definitions
- `services/` - External service connections (Redis, PostgreSQL, job queue)
- `middleware/` - Request processing (logging, error handling)
- `types/` - Comprehensive TypeScript interfaces for the entire system
- `utils/` - Configuration and logging utilities

### Worker Structure (`worker/src/`)
- `index.ts` - BullMQ worker setup and job processing
- `services/scanProcessor.ts` - Main job processing logic
- Modular OSINT modules for different reconnaissance techniques

### Frontend Structure (`frontend/src/`)
- `App.tsx` - Main React application with routing
- `pages/` - Main application views (ScanForm, Dashboard, Results)
- `components/` - Reusable UI components
- Uses TanStack Query for API state management

### Key Technical Concepts

**Job Processing Flow**:
1. Frontend submits scan request with consent
2. Backend validates input and creates BullMQ job
3. Worker processes job using appropriate OSINT modules
4. Results stored and streamed back via WebSocket
5. Frontend displays live progress and final results

**Security Model**:
- All API keys handled server-side via proxy endpoints
- Input validation using Joi schemas
- Rate limiting on all endpoints
- Docker container isolation for external tools
- Audit logging for compliance

**Consent System**:
- Mandatory typed consent confirmation
- Consent hash stored with all scan results
- Unskippable consent flow in frontend
- Admin approval required for active scanning modules

## Environment Configuration

### Demo Mode (Default)
- Set `DEMO_MODE=true` in `.env`
- Works without real API keys
- Returns sample data for `example.com`
- Perfect for development and testing

### Production Setup
- Generate secure values for `JWT_SECRET`, `ENCRYPTION_KEY`, `ADMIN_TOKEN`
- Add real API keys for: Shodan, GitHub, Google Custom Search, SecurityTrails, Censys
- Set `DEMO_MODE=false`
- Configure rate limits and job concurrency

### Critical Environment Variables
```bash
# Security (required)
JWT_SECRET=your_secure_jwt_secret
ENCRYPTION_KEY=your_32_character_key
ADMIN_TOKEN=admin_approval_token

# Demo vs Production
DEMO_MODE=true  # Set to false for real scans

# Performance tuning
MAX_CONCURRENT_JOBS=5
RATE_LIMIT_REQUESTS_PER_MINUTE=60
```

## API Design Patterns

### Main Endpoints
- `POST /api/scan` - Start reconnaissance job (requires consent)
- `GET /api/scan/:jobId/status` - Job progress tracking  
- `GET /api/scan/:jobId/results` - Retrieve scan results
- `POST /api/scan/:jobId/cancel` - Cancel running job
- WebSocket endpoint for live progress updates

### Response Format
All API responses follow consistent structure:
```typescript
{
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

## Testing Strategy

### Test Structure
- `backend/` - API endpoint and service tests  
- `frontend/` - Component and integration tests using Vitest
- `worker/` - Job processing and module tests
- `tests/` - End-to-end integration tests

### Running Tests
```bash
# Full test suite
npm test

# Watch mode for development
cd backend && npm run test:watch
cd frontend && npm run test

# Integration tests with Docker
docker-compose -f docker-compose.test.yml up --build
npm run test:integration
```

## Key Dependencies and Tools

### Backend Stack
- **Fastify** - High-performance web framework
- **BullMQ** - Redis-based job queue
- **Winston** - Structured logging
- **Joi** - Input validation
- **Dockerode** - Docker container management

### Frontend Stack
- **Vite** - Fast build tool and dev server
- **TanStack Query** - Server state management
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Development Tools
- **TypeScript** - Type safety across entire stack
- **ESLint + Prettier** - Code quality and formatting
- **ts-node-dev** - Development server with hot reload

## Ethical and Legal Considerations

### Mandatory Consent Flow
- All scans require explicit written consent
- Consent dialog cannot be bypassed
- Consent records kept for audit trails
- Active scanning requires additional admin approval

### Security-First Development
- Never expose API keys in frontend code
- All external API calls proxied through backend
- Input sanitization prevents injection attacks
- Docker sandboxing isolates external tools
- Rate limiting prevents abuse

### Compliance Features
- Audit logging of all actions
- Consent hash verification
- Passive scanning by default
- Clear legal warnings throughout UI

This platform is designed exclusively for authorized, ethical reconnaissance. All development should prioritize security, consent, and legal compliance.