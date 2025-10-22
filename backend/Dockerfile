# Backend Dockerfile
FROM node:18-bullseye-slim

# Optional: skip Chromium download to keep image light
ENV PUPPETEER_SKIP_DOWNLOAD=1
ENV NODE_ENV=production

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY src ./src

EXPOSE 5000

CMD ["node", "src/server.js"]