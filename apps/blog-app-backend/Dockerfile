# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Copy the entire workspace
COPY apps/blog-app-backend ./apps/blog-app-backend
COPY libs ./libs

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate --schema ./apps/blog-app-backend/prisma/schema.prisma

# Build the application
RUN npx nx build blog-app-backend --configuration=production

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist/apps/blog-app-backend ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]