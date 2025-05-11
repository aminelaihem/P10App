#!/bin/sh

# Copie le bon fichier d'env selon la variable ENV_FILE (défaut : .env.dev)
cp "/usr/src/app/${ENV_FILE:-.env.dev}" /usr/src/app/.env

# Lance l'application
npm run start:prod 