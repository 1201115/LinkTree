FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --verbose
COPY . .

FROM base AS build
RUN npx prisma generate

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app /app
EXPOSE 4000
CMD ["node", "src/server.js"]
