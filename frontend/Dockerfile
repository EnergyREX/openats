FROM node:22-slim

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
# -H 0.0.0.0 para que Next escuche fuera del contenedor (no solo localhost interno)
CMD ["sh", "-c", "npm run dev -- -H 0.0.0.0"]
