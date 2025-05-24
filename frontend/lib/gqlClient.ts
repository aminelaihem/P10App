// lib/gqlClient.ts
export type GraphQLVariables = Record<string, unknown>;

export async function gqlClient(query: string, variables: GraphQLVariables = {}) {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL || "http://host.docker.internal:3001/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
  
    const data = await response.json();
  
    if (!response.ok || data.errors || !data.data) {
      const message = data?.errors?.[0]?.message || "Erreur GraphQL inconnue";
      console.error("GraphQL Error:", message);
      throw new Error(message);
    }
  
    return data.data;
  }
  