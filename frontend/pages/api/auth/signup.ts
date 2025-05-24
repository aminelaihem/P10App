import type { NextApiRequest, NextApiResponse } from 'next';
import * as cookie from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { email, password, firstname, lastname } = req.body;
  if (!email || !password || !firstname || !lastname) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://host.docker.internal:3001/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation Signup($email: String!, $password: String!, $firstname: String!, $lastname: String!) {
            signup(data: {
              email: $email,
              password: $password,
              firstname: $firstname,
              lastname: $lastname
            }) {
              token
              user {
                email
                firstname
                lastname
              }
            }
          }
        `,
        variables: { email, password, firstname, lastname }
      })
    });

    const data = await response.json();

    // Si erreur retournée ou signup absent
    if (!response.ok || data.errors || !data?.data?.signup) {
      const message = data?.errors?.[0]?.message || 'Erreur inconnue';
      console.error('Erreur GraphQL:', message);
      return res.status(400).json({ error: message });
    }

    const { token, user } = data.data.signup;

    if (!token) {
      console.error('Token manquant');
      return res.status(400).json({ error: 'Échec de l\'authentification' });
    }

    res.setHeader('Set-Cookie', cookie.serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    }));

    return res.status(200).json({ user });

  } catch (err) {
    console.error('Erreur API signup:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}