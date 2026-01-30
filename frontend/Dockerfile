FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --verbose
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app /app
EXPOSE 3000
CMD ["npm", "run", "start"]
