# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency manifests first to leverage Docker layer cache
COPY package*.json ./

# Install ALL deps (including dev — needed to compile TypeScript)
RUN npm ci

# Copy source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build


# Stage 2: Production
FROM node:20-alpine AS production

# Set non-root user for security (node user ships with node:alpine)
RUN apk add --no-cache dumb-init

WORKDIR /usr/src/app

# Copy only dependency manifests for production install
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Use non-root user
USER node

# Expose the application port
EXPOSE 3000

# Use dumb-init to handle signals properly (prevents zombie processes)
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/main.js"]
