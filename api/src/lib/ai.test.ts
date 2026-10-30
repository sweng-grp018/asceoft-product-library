import assert from "node:assert/strict";
import { test } from "node:test";
import { cosine, bestMatch } from "./ai.js";

test("cosine similarity handles identical, orthogonal and invalid vectors", () => {
  assert.equal(cosine([1, 0], [1, 0]), 1);
  assert.equal(cosine([1, 0], [0, 1]), 0);
  assert.equal(cosine([1], [1, 0]), 0);
});
test("unrecognized image is unknown even with a nearby candidate below threshold", () => {
  assert.deepEqual(bestMatch([1, 0], [{ productId: "sku", embedding: [0, 1] }]), {
    productId: null,
    similarity: 0,
  });
});
