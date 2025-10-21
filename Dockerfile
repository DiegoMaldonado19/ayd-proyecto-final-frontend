FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production=false

COPY . .

RUN npm install -g @angular/cli

FROM node:20-alpine
WORKDIR /app

RUN npm install -g @angular/cli

COPY package*.json ./
RUN npm ci --only=production

COPY --from=build /app .

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--poll", "2000"]
