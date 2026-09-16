const BACKEND_URL = (process.env.API_INTERNAL_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

/** Same-origin path, proxied to the Payload backend via next.config.ts rewrites. */
export const CMS_PROXY_PATH = "/api/cms";

/** Absolute GraphQL endpoint, resolved per-environment (server vs. browser). */
export function graphqlEndpoint(): string {
  if (typeof window === "undefined") {
    return `${BACKEND_URL}/api/graphql`;
  }
  return `${CMS_PROXY_PATH}/api/graphql`;
}

/** REST endpoint for a given Payload path (e.g. "/api/globals/home-information"). */
export function restEndpoint(path: string): string {
  if (typeof window === "undefined") {
    return `${BACKEND_URL}${path}`;
  }
  return `${CMS_PROXY_PATH}${path}`;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

/** Fetch helper for GraphQL queries. Swallows errors and returns null. */
export async function gqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  revalidate = 60,
): Promise<T | null> {
  try {
    const res = await fetch(graphqlEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      next: { revalidate },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as GraphQLResponse<T>;
    if (json.errors?.length) {
      console.error("GraphQL errors:", json.errors);
      return null;
    }
    return json.data ?? null;
  } catch (err) {
    console.error("GraphQL fetch failed:", err);
    return null;
  }
}

/** Mutation helper. Throws on failure so callers can surface errors to the UI. */
export async function gqlMutate<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(graphqlEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`);
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) throw new Error(json.errors[0].message);
  if (!json.data) throw new Error("GraphQL request returned no data");
  return json.data;
}

/** REST fetch helper, used for globals whose field names aren't valid GraphQL identifiers. */
export async function restFetch<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(restEndpoint(path), { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err) {
    console.error("REST fetch failed:", err);
    return null;
  }
}
