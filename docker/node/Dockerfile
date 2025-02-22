# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files first
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy everything from builder
COPY --from=builder /app ./

# Create non-root user with a different group ID
RUN addgroup -g 2000 appgroup && \
    adduser -u 2000 -G appgroup -s /bin/sh -D appuser && \
    chown -R appuser:appgroup /app

USER appuser

# Default to npm start, but allow override via docker-compose
CMD ["npm", "run", "start"] 