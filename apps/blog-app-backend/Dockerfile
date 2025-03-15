# Use Node.js LTS version
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/blog-app-backend ./apps/blog-app-backend

# Create upload directories
RUN mkdir -p apps/blog-app-backend/uploads \
    && mkdir -p apps/blog-app-backend/src/uploads

# Build the application
RUN npx nx build blog-app-backend

# Production stage
FROM node:20-alpine

WORKDIR /app

# Create upload directory for runtime
RUN mkdir -p /app/uploads && chown -R node:node /app

# Copy build artifacts
COPY --from=builder /app/dist/apps/blog-app-backend ./
COPY --from=builder /app/apps/blog-app-backend/uploads ./uploads

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "main.js"]
