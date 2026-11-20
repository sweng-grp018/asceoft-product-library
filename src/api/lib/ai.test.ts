import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "node:http";
import axios from "axios";
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
  const original = axios.defaults.adapter;
  let requests = 0;
  axios.defaults.adapter = async () => {
    requests++;
    throw new Error("Unexpected network request");
  };
  t.after(() => {
    axios.defaults.adapter = original;
  });
  assert.throws(() => createAiClient(undefined), ServerInferenceUnavailableError);
  assert.equal(requests, 0);
});

test("Axios preserves inference payloads and handles unavailable or malformed responses", async (t) => {
  const image = Buffer.from("local prototype image");
  let malformed = false;
  const server = createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    assert.equal(req.method, "POST");
    assert.match(req.headers["content-type"] ?? "", /application\/json/);
    assert.deepEqual(JSON.parse(Buffer.concat(chunks).toString()), {
      imageBase64: image.toString("base64"),
    });
    res.setHeader("content-type", "application/json");
    res.statusCode = req.url === "/embed" ? 503 : 200;
    res.end(malformed ? "invalid JSON" : JSON.stringify({ detections: [] }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const infer = createAiClient(`http://127.0.0.1:${address.port}`);
  assert.deepEqual(await infer("/detect", image), { detections: [] });
  await assert.rejects(infer("/embed", image), {
    message: "AI inference unavailable",
    status: 502,
  });
  malformed = true;
  await assert.rejects(infer("/detect", image), {
    message: "AI inference unavailable",
    status: 502,
  });
});
