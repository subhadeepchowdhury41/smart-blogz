# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY eslint.config.* ./
COPY .eslintrc* ./

# Copy the entire workspace
COPY apps/blog-frontend ./apps/blog-frontend
COPY libs ./libs

# Install dependencies
RUN npm ci

# Build the application
RUN npx nx build blog-frontend --configuration=production --skip-nx-cache

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist/apps/blog-frontend /usr/share/nginx/html

# Copy nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]