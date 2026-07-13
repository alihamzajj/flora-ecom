# Railway / production API image (Express only)
FROM node:22-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm install

COPY server/ ./
RUN npm run build

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
