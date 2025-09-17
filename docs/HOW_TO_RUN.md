# How to Run OSINT Recon

This guide provides step-by-step instructions for running the OSINT Recon platform locally.

## 🚨 Legal and Ethical Notice

**CRITICAL**: This tool is for ethical, consensual reconnaissance only. You MUST have explicit written permission to scan any target. Unauthorized scanning is illegal and unethical.

## Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js 18+** for local development
- **Git** (optional, for version control)

## Quick Start (Demo Mode)

### Option 1: Using Docker Compose (Recommended)

1. **Clone or navigate to the project directory**:
   ```bash
   cd osint-recon
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Start all services**:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/docs

5. **Stop services**:
   ```bash
   docker-compose down
   ```

### Option 2: Local Development Setup

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Start infrastructure services** (Redis & PostgreSQL):
   ```bash
   docker-compose up -d redis postgres
   ```

3. **Run in development mode**:
   ```bash
   npm run dev
   ```

## Demo Mode Features

Demo mode is enabled by default and provides:
- Mock API responses (no real API keys required)
- Sample scan results for `example.com`
- All functionality except real third-party API calls

## Full Setup (Production-like)

### 1. Environment Configuration

Edit `.env` file with your API keys:

```bash
# Required for production
JWT_SECRET=your_secure_jwt_secret_key_here
ENCRYPTION_KEY=your_32_character_encryption_key
ADMIN_TOKEN=your_secure_admin_token

# Optional API keys (leave blank for demo mode)
SHODAN_API_KEY=your_shodan_api_key
GITHUB_OAUTH_TOKEN=your_github_token
GOOGLE_CUSTOM_SEARCH_KEY=your_google_api_key
GOOGLE_CUSTOM_SEARCH_CX=your_search_engine_id

# Disable demo mode for real scans
DEMO_MODE=false
```

### 2. Start Services

```bash
docker-compose up -d
```

### 3. Verify Services

Check service health:
```bash
curl http://localhost:3001/api/health
```

View logs:
```bash
docker-compose logs -f
```

## Testing the Application

### Running a Demo Scan

1. Open the frontend at http://localhost:3000
2. Fill out the consent form:
   - Target: `example.com`
   - Target Type: `domain`
   - Check consent checkbox
   - Type confirmation text
3. Select scan modules (defaults are fine)
4. Click "Start Scan"
5. Monitor progress on the dashboard
6. View results when complete

### API Testing

Test the API directly:

```bash
# Start a scan
curl -X POST http://localhost:3001/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "target": "example.com",
    "targetType": "domain",
    "modules": ["subdomains", "certificates"],
    "scope": {"type": "public-web"},
    "consent": {
      "type": "typed",
      "value": "I have permission",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
      "ipAddress": "127.0.0.1",
      "userAgent": "curl"
    },
    "rateProfile": "low",
    "enableActiveModules": false
  }'

# Check job status (replace JOB_ID with returned jobId)
curl http://localhost:3001/api/scan/JOB_ID/status

# Get results
curl http://localhost:3001/api/scan/JOB_ID/results
```

## Running Tests

### Unit Tests

```bash
# All tests
npm test

# Individual components
npm run test:backend
npm run test:worker
npm run test:frontend
```

### Integration Tests

```bash
# Start test environment
docker-compose -f docker-compose.test.yml up --build

# Run integration tests
npm run test:integration
```

## Development

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run build
```

### Database Migrations

```bash
# Run migrations (if using persistent storage)
docker-compose exec backend npm run migrate
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f worker
docker-compose logs -f frontend
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `.env` file if 3000/3001 are in use
2. **Redis connection failed**: Ensure Redis is running (`docker-compose up redis`)
3. **Database connection failed**: Ensure PostgreSQL is running and credentials are correct
4. **Worker not processing jobs**: Check Redis connection and worker logs

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug docker-compose up
```

### Reset Environment

```bash
# Stop all services
docker-compose down

# Remove volumes (will delete all data)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │     Worker      │
│   (React)       │    │   (Fastify)     │    │   (BullMQ)      │
│   Port: 3000    │◄──►│   Port: 3001    │◄──►│                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │     Redis       │    │   PostgreSQL    │
         │              │   (Queue)       │    │   (Optional)    │
         └──────────────┤   Port: 6379    │    │   Port: 5432    │
                        └─────────────────┘    └─────────────────┘
```

## Security Notes

- Never expose API keys in frontend code
- Use HTTPS in production
- Regularly rotate secrets
- Monitor for suspicious activity
- Keep consent records for compliance

## Performance Tuning

- Adjust `MAX_CONCURRENT_JOBS` in `.env`
- Configure rate limits for your API usage
- Monitor Redis memory usage
- Scale worker processes as needed

## Getting Help

- Check logs first: `docker-compose logs -f`
- Review API documentation: http://localhost:3001/docs
- Ensure all prerequisites are installed
- Verify environment configuration

---

**Remember**: Always obtain explicit permission before scanning any target. This tool is for authorized security testing only.