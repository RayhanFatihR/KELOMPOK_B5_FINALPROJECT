<<<<<<< HEAD
<<<<<<< HEAD
FROM node:18
=======
# import image node versi 18 alpine
=======
# =============================
# STAGE 1: Dependencies
# =============================
FROM node:18-alpine AS dependencies

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# =============================
# STAGE 2: Production
# =============================
>>>>>>> 29a7576 (2)
FROM node:18-alpine
>>>>>>> d7f8d39 (1)

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /usr/src/app

# Copy dependencies from previous stage
COPY --from=dependencies --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Create necessary directories
RUN mkdir -p views public && \
    chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

# Expose app port
EXPOSE 3000
<<<<<<< HEAD
=======

<<<<<<< HEAD
>>>>>>> d7f8d39 (1)
=======
# Remove Dockerfile healthcheck: handled in docker-compose.yml
# HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the app
>>>>>>> 29a7576 (2)
CMD ["node", "app.js"]
