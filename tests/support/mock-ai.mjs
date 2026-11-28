// Local QA substitute for the Python service. One known detection and embedding.
import { createServer } from "node:http";
import { createHash } from "node:crypto";
createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200).end("ok");
    return;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  res.setHeader("Content-Type", "application/json");
  try {
    const { imageBase64 } = JSON.parse(Buffer.concat(chunks).toString());
    // The red PNG fixture simulates an unavailable inference service.
    if (
      imageBase64 ===
      "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEklEQVR4nGP8z4AdMOEQH6QSAM1BAQ/oQeJvAAAAAElFTkSuQmCC"
    ) {
      res.writeHead(503).end('{"error":"Offline test"}');
      return;
    }
    const digest = createHash("sha512").update(Buffer.from(imageBase64, "base64")).digest();
    const vector = Array.from({ length: 512 }, (_, bit) =>
      digest[Math.floor(bit / 8)] & (1 << (bit % 8)) ? 1 : -1,
    );
    if (req.url === "/embed")
      res.end(JSON.stringify({ embedding: vector, model: "openclip-ViT-B-32-openai" }));
    else if (req.url === "/detect")
      res.end(
        JSON.stringify({
          width: 1,
          height: 1,
          detectorModel: "qa",
          detections: [{ embedding: vector, boundingBox: [0, 0, 1, 1], detectorScore: 0.99 }],
        }),
      );
    else res.writeHead(404).end("{}");
  } catch {
    res.writeHead(400).end("{}");
  }
}).listen(18080, "127.0.0.1", () => console.log("Local AI fixture listening on 18080"));
