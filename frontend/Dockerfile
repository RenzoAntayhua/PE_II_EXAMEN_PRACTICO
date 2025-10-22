# Frontend Dockerfile
FROM node:18-bullseye-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

EXPOSE 5173

# Run Vite dev server and accept external connections
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]