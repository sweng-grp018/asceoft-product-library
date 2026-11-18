import assert from "node:assert/strict";
import { test, mock } from "node:test";
import { cosine, bestMatch, createAiClient, ServerInferenceUnavailableError } from "./ai.js";

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

test("disabled server inference fails before any network request", (t) => {
  const request = mock.method(globalThis, "fetch", async () => {
    throw new Error("Unexpected network request");
  });
  t.after(() => request.mock.restore());
  assert.throws(() => createAiClient(undefined), ServerInferenceUnavailableError);
  assert.equal(request.mock.callCount(), 0);
});

test("an explicit standalone endpoint preserves the image inference contract", async (t) => {
  const image = Buffer.from("local prototype image");
  const request = mock.method(
    globalThis,
    "fetch",
    async (...[input, options]: Parameters<typeof fetch>) => {
      assert.equal(String(input), "http://127.0.0.1:8000/detect");
      assert.equal(options?.method, "POST");
      assert.deepEqual(JSON.parse(String(options?.body)), {
        imageBase64: image.toString("base64"),
      });
      return Response.json({ detections: [] });
    },
  );
  t.after(() => request.mock.restore());
  const infer = createAiClient("http://127.0.0.1:8000");
  assert.deepEqual(await infer("/detect", image), { detections: [] });
  assert.equal(request.mock.callCount(), 1);
});
