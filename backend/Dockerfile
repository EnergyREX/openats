FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ graphicsmagick ghostscript \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 6500
CMD sh -c "npx drizzle-kit migrate && npm run dev"