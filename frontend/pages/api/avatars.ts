import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://host.docker.internal:3001/graphql';
    console.log('Tentative de connexion à:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query {
            availableAvatars {
              id
              pictureAvatarUrl
            }
          }
        `
      })
    });

    const data = await response.json();
    console.log('Réponse API:', data);

    if (!response.ok || data.errors) {
      throw new Error(data.errors?.[0]?.message || 'Erreur lors de la récupération des avatars');
    }

    return res.status(200).json(data.data.availableAvatars);
  } catch (error) {
    console.error('Erreur API avatars:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
} 