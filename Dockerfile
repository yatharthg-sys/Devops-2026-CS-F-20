# Multi-stage production Dockerfile for Shekhawat Dhaba Web Application
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install dependencies layer
FROM base AS dependencies
WORKDIR /app/Backend
COPY Backend/package*.json ./
RUN npm ci --omit=dev

# Final runtime image
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root application user for container security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 dhabauser

# Copy backend dependencies
COPY --from=dependencies /app/Backend/node_modules ./Backend/node_modules

# Copy application source code
COPY Backend ./Backend
COPY Frontend ./Frontend

# Ensure correct file permissions
RUN chown -R dhabauser:nodejs /app

USER dhabauser

# Expose server port
EXPOSE 5000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/api/health || exit 1

WORKDIR /app/Backend

# Start Node.js server
CMD ["node", "server.js"]
