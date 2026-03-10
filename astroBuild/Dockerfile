FROM node:22.12.0-slim
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["node", "./dist/server/entry.mjs"]
