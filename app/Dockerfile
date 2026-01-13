# Multi-stage Dockerfile for production

# Stage: install production dependencies
FROM node:18-alpine AS dependencies
WORKDIR /usr/src/app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage: production image
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /usr/src/app

# Copy dependencies from previous stage
COPY --from=dependencies --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Create necessary directories and set permissions
RUN mkdir -p views public && chown -R nodejs:nodejs /usr/src/app

# Use non-root user
USER nodejs

EXPOSE 3000

# Entrypoint and default command
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "app.js"]
