# Use Node.js version 23-slim which supports TypeScript type stripping natively
FROM node:23-slim AS builder

# Install build tools for better-sqlite3 (it's a native module)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install all dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the frontend (Vite)
RUN npm run build

# Production stage
FROM node:23-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy compiled node_modules from builder (includes native modules like better-sqlite3)
COPY --from=builder /app/node_modules ./node_modules

# Copy built frontend and server code
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./

# Expose port 3000
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Start the server
# Node 23 supports TypeScript stripping with the --experimental-strip-types flag
CMD ["node", "--experimental-strip-types", "server.ts"]
