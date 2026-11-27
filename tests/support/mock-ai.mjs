// Local QA substitute for the Python service. One known detection and embedding.
import { createServer } from "node:http";
const vector = Array(512).fill(0);
vector[0] = 1;
createServer(async (req, res) => {
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
