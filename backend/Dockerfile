FROM node:20-alpine

WORKDIR /usr/src/app

# Installe NestJS CLI globalement
RUN npm install -g @nestjs/cli

# Installe les dépendances
COPY package*.json ./
RUN npm install

# Copie le reste du projet
COPY . .

# Génère le client Prisma
RUN npx prisma generate

# Compile le projet
RUN npm run build

# Expose le port 3001 pour GraphQL
EXPOSE 3001

# Démarre l'application
CMD ["npm", "run", "start:prod"]