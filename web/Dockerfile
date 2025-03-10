FROM node:18-alpine AS build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:18-alpine AS runtime-stage

WORKDIR /app

COPY --from=build-stage /app/dist /app/dist
COPY --from=build-stage /app/package*.json ./

RUN npm install --omit=dev --legacy-peer-deps

EXPOSE 4000

CMD ["npm", "run", "serve:ssr:web"]
