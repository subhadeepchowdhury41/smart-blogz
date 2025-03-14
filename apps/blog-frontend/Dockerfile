# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Copy source code
COPY apps/blog-frontend ./apps/blog-frontend

# Install dependencies
RUN npm ci

# Build the application
RUN npx nx build blog-frontend --configuration=production

# Production stage with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist/apps/blog-frontend /usr/share/nginx/html

# Copy Nginx configuration
COPY apps/blog-frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
