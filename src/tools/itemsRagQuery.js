import { Index as UpstashIndex } from "@upstash/vector";

// Initialize Upstash Vector client
const index = new UpstashIndex({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN
});

export const queryItems = async (query, filters, topK = 5) => {
  let filterStr = "";
  if (filters) {
    const filterParts = Object.entries(filters)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}='${value}'`);

    if (filterParts.length > 0) {
      filterStr = filterParts.join(" AND ");
    }
  }

  const results = await index.query({
    data: query,
    topK,
    filter: filterStr || undefined,
    includeMetadata: true,
    includeData: true
  });

  return results;
};
