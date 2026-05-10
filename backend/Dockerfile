# ─────────────────────────────────────────────────────────────
# Stage 1: Dependencies
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

# Install ALL dependencies including devDependencies
RUN npm ci


# ─────────────────────────────────────────────────────────────
# Stage 2: Build
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


# ─────────────────────────────────────────────────────────────
# Stage 3: Production
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Copy built application
COPY --from=build /app/dist ./dist

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

USER appuser

EXPOSE 3000

CMD ["node", "dist/main.js"]
