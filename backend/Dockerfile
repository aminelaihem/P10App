FROM node:18-alpine

WORKDIR /usr/src/app

RUN npm install -g @nestjs/cli


COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
