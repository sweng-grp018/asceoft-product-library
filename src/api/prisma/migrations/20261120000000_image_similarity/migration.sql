BEGIN;

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "ReferenceImage"
  ADD COLUMN "searchEmbedding" vector(512)
  GENERATED ALWAYS AS (
    CASE
      WHEN cardinality("embedding") = 512
        AND array_position("embedding", NULL) IS NULL
        AND -1.001 <= ALL("embedding")
        AND 1.001 >= ALL("embedding")
      THEN "embedding"::vector(512)
    END
  ) STORED;

COMMIT;
