import { db } from "../../lib/db.js";
import { EMBEDDING_MODEL } from "../../lib/ai.js";

type ImageMatch = {
  queryIndex: number;
  productId: string;
  name: string;
  sku: string;
  brand: string | null;
  similarity: number;
};

export async function findImageMatches(embeddings: number[][], limit: number) {
  if (!embeddings.length) return [];

  return db.$queryRaw<ImageMatch[]>`
    SELECT (q.ordinality - 1)::integer AS "queryIndex", match.*
    FROM jsonb_array_elements_text(${JSON.stringify(embeddings)}::jsonb)
      WITH ORDINALITY AS q(embedding, ordinality)
    CROSS JOIN LATERAL (
      SELECT p.id AS "productId", p.name, p.sku, p.brand,
             1 - MIN(r."searchEmbedding" <=> q.embedding::vector(512)) AS similarity
      FROM "ReferenceImage" r
      JOIN "Product" p ON p.id = r."productId"
      WHERE p."indexStatus" = 'INDEXED'
        AND r."embeddingModel" = ${EMBEDDING_MODEL}
        AND vector_norm(r."searchEmbedding") > 0
      GROUP BY p.id
      ORDER BY similarity DESC, p.id
      LIMIT ${limit}
    ) match
    ORDER BY q.ordinality, match.similarity DESC, match."productId"
  `;
}
