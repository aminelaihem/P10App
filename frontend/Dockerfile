# Utilise une image Node complète pour la compatibilité
FROM node:18

# Dossier de travail dans le container
WORKDIR /app

# Copie uniquement les fichiers nécessaires au cache Docker
COPY package*.json ./

# Installe les dépendances (plus flexible pour dev que npm ci)
RUN npm install

# Copie tout le reste du projet
COPY . .

# Build l’app en production
RUN npm run build

# Expose le port par défaut de Next.js
EXPOSE 3000

# Lance Next.js en production
CMD ["npm", "run", "start"]
