# Build Stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy necessary package files for efficient caching
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY workspace.json ./

# Install dependencies (no dev dependencies to keep it clean)
RUN npm ci

# Copy full source code
COPY . . 

# Generate Prisma Client
RUN npx prisma generate --schema=./apps/blog-app-backend/prisma/schema.prisma

# Build the backend app
RUN npx nx build blog-app-backend --configuration=production

# Production Stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only production dependencies
COPY --from=builder /app/dist/apps/blog-app-backend/package*.json ./
RUN npm ci --omit=dev

# Copy built application files
COPY --from=builder /app/dist/apps/blog-app-backend ./

# Copy Prisma migrations and schema if needed
COPY --from=builder /app/apps/blog-app-backend/prisma ./prisma/

# Create an uploads directory
RUN mkdir -p /app/uploads && chown -R node:node /app && chmod 755 /app/uploads

# Use non-root user for security
USER node

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "main.js"]
