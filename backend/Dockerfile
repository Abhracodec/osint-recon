FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache curl bash

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S osint -u 1001

# Create logs directory
RUN mkdir -p logs && chown osint:nodejs logs

# Change ownership of app directory
RUN chown -R osint:nodejs /app

# Switch to non-root user
USER osint

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start the application using ts-node-dev for hot reload
CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/index.ts"]
