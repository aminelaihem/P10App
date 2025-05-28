import { NextResponse } from 'next/server';
import { gqlClient } from '@/lib/gqlClient';

export async function GET() {
  try {
    const query = `
      query {
        avatars {
          id
          pictureAvatarUrl
        }
      }
    `;

    console.log('Envoi de la requête GraphQL...');
    const data = await gqlClient(query);
    console.log('Réponse reçue:', data);

    // S'assurer que data.avatars est un tableau
    const avatars = Array.isArray(data.avatars) ? data.avatars : [];
    console.log('Avatars traités:', avatars);
    
    return NextResponse.json(avatars);
  } catch (error) {
    console.error('Erreur détaillée:', error);
    return NextResponse.json([], { status: 500 });
  }
} 