# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY ../../package*.json ./
COPY ../../nx.json ./
COPY ../../tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . ./apps/blog-app-backend

# Build the application
RUN npx nx build blog-app-backend

# Production stage
FROM node:20-alpine

# Create app directory and set ownership
WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/dist/apps/blog-app-backend/package*.json ./
RUN npm ci --only=production

# Copy build artifacts
COPY --from=builder /app/dist/apps/blog-app-backend ./

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads \
  && chown -R node:node /app \
  && chmod 755 /app/uploads

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "main.js"]
