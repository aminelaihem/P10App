// features/auth/api/authApi.ts
import { gqlClient } from "@/lib/gqlClient";

export interface User {
  email: string;
  firstname: string;
  lastname: string;
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const query = `
    mutation Login($email: String!, $password: String!) {
      login(data: { email: $email, password: $password }) {
        token
        user {
          email
          firstname
          lastname
        }
      }
    }
  `;

  const data = await gqlClient(query, { email, password });
  return data.login;
}

export async function signup(
  email: string,
  password: string,
  firstname: string,
  lastname: string,
  avatarId: string
): Promise<{ token: string; user: User }> {
  const query = `
    mutation Signup($email: String!, $password: String!, $firstname: String!, $lastname: String!, $avatarId: String!) {
      signup(data: {
        email: $email,
        password: $password,
        firstname: $firstname,
        lastname: $lastname,
        avatarId: $avatarId
      }) {
        token
        user {
          email
          firstname
          lastname
        }
      }
    }
  `;

  const data = await gqlClient(query, { email, password, firstname, lastname, avatarId });
  return data.signup;
}