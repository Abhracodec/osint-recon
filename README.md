# OSINT Recon - Ethical Reconnaissance Platform

A production-quality, secure, and ethical OSINT (Open Source Intelligence) reconnaissance single-page web application built with React, TypeScript, and Node.js.

## 🛡️ Ethics & Legal Notice

**IMPORTANT**: This tool is designed for ethical, consensual reconnaissance only. Users MUST have explicit written permission to scan any target. Unauthorized scanning is illegal and unethical.

### Key Ethical Features:
- ✅ Mandatory consent dialog before any scan
- ✅ Passive reconnaissance by default
- ✅ Active modules require explicit consent + admin approval
- ✅ No exploitation attempts (reconnaissance only)
- ✅ Rate limiting and API respect
- ✅ Ephemeral data storage by default

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + TypeScript + Fastify + BullMQ
- **Worker**: Background job processing with Docker sandboxing
- **Storage**: Redis (ephemeral) + PostgreSQL (optional persistent)
- **Deployment**: Docker Compose

## 🚀 Quick Start

See [HOW_TO_RUN.md](docs/HOW_TO_RUN.md) for detailed setup instructions.

```bash
# Clone and start demo mode
cp .env.example .env
docker-compose up -d
# Access app at http://localhost:3000
```

## 📋 Features

### Passive Reconnaissance (Default)
- Certificate Transparency (crt.sh)
- Subdomain enumeration (passive sources)
- Shodan/Censys service discovery
- GitHub code search for leaks
- Technology stack detection
- Google Custom Search dorks
- Email harvesting (public sources)

### Active Reconnaissance (Consent Required)
- Amass/subfinder subdomain brute forcing
- DNS mass resolution
- Network port scanning (sandboxed)

### Security Features
- Input validation and sanitization
- SSRF protection
- Command injection prevention
- Docker container sandboxing
- Server-side API proxy (keys never exposed)
- Rate limiting (per-user and global)
- Audit logging

## 📁 Project Structure

```
osint-recon/
├── frontend/          # React SPA
├── backend/           # API server
├── worker/            # Background job processor
├── infra/             # Docker & deployment configs
├── tests/             # Test suites
├── docs/              # Documentation & samples
└── README.md
```

## 🔧 Development

```bash
# Install dependencies
npm run install:all

# Run in development mode
docker-compose -f docker-compose.dev.yml up

# Run tests
npm test

# Lint and format
npm run lint
npm run format
```

## 📊 API Endpoints

- `POST /api/scan` - Start new reconnaissance job
- `GET /api/scan/:jobId/status` - Get job status
- `GET /api/scan/:jobId/results` - Get results
- `POST /api/scan/:jobId/cancel` - Cancel job
- Various proxy endpoints for third-party APIs

## ⚖️ Legal Compliance

This tool is designed to respect:
- Website terms of service
- API rate limits and usage policies
- robots.txt files
- Local and international laws

## 🤝 Contributing

Please read our security and ethics guidelines before contributing.

## 📄 License

MIT License - See LICENSE file for details.

---

**Reminder**: Always obtain explicit permission before scanning any target. Respect privacy and security boundaries.