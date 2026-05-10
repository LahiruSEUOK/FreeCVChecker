# ─────────────────────────────────────────────────────────────
# Stage 1: Install Dependencies
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

# Install all dependencies for build
RUN npm ci

# Save production-only node_modules separately
RUN npm prune --omit=dev && cp -R node_modules /tmp/prod_modules


# ─────────────────────────────────────────────────────────────
# Stage 2: Build Application
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


# ─────────────────────────────────────────────────────────────
# Stage 3: Production Image
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built app
COPY --from=build /app/dist ./dist

# Copy production dependencies
COPY --from=deps /tmp/prod_modules ./node_modules

# Copy package files
COPY package*.json ./

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

USER appuser

# Expose app port
EXPOSE 3000

# Start application
CMD ["node", "dist/main.js"]
