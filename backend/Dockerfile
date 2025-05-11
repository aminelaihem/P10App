FROM node:18-alpine

WORKDIR /usr/src/app

RUN npm install -g @nestjs/cli


COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Script d'entrée pour copier le bon .env
COPY docker-entrypoint.sh /usr/src/app/docker-entrypoint.sh
RUN chmod +x /usr/src/app/docker-entrypoint.sh

EXPOSE 3000

CMD ["/usr/src/app/docker-entrypoint.sh"]
