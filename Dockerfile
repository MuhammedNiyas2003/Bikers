# Stage 1: Build the frontend React app
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Run the production application
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=frontend-builder /app/dist ./dist
COPY --from=frontend-builder /app/server.cjs ./
COPY --from=frontend-builder /app/assets ./assets

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

# Run the backend express server which serves both API and frontend static build
CMD ["node", "server.cjs"]
