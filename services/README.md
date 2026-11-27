# Standalone AI prototype

This directory is an independent Python project. It is excluded from the Vercel web deployment, is not started by `bun run dev:all`, and has its own CI workflow. You can install and run it without the Next.js app, Express API, PostgreSQL or S3.

The existing FastAPI code is a legacy inference prototype: generic YOLO11 detection plus OpenCLIP embeddings. It does not train or fine-tune models. The team's YOLO26n detector is trained independently on SKU-110K; the intended browser workflow detects objects, crops them and identifies SKUs in a separate step. This prototype still defaults to YOLO11. See [the browser inference handoff](../docs/browser-inference.md).

## Optional local prototype

Use Python 3.11–3.13 and uv. From this directory:

```bash
uv sync --extra dev
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
```

`GET /health` checks the service. `POST /embed` and `POST /detect` accept a JSON `imageBase64` value. Weights download on first inference. Set `YOLO_WEIGHTS` in this process to select a compatible detector checkpoint. Its class labels are not currently used for SKU mapping; the legacy API still matches OpenCLIP embeddings.

To exercise the legacy Express workflows locally, explicitly set `AI_SERVICE_URL=http://127.0.0.1:8000` in the web project's root `.env` and restart the API. Omit it for ordinary web development. The prototype has no service authentication and should stay bound to loopback for local experimentation.

## Connecting a deployed API via Cloudflare Tunnel

If the web app and Express API are deployed (for example on Vercel) and you want AI requests (`/embed` and `/detect`) forwarded to a local machine running this service, expose `http://127.0.0.1:8000` with **Cloudflare Tunnel (`cloudflared`)**.

- **Install `cloudflared` only on the machine that runs the AI service.** Do not add `cloudflared` to the GitHub repository, and never commit tunnel credentials.
- **No codebase changes are required.** The deployed Express API reads `AI_SERVICE_URL` and sends inference requests there.

1. Start the local AI service on that machine (Terminal 1, from `services/`):

   ```bash
   uv sync --extra dev
   uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```

2. Start a Quick Tunnel on the same machine (Terminal 2):

   ```bash
   cloudflared tunnel --url http://127.0.0.1:8000
   ```

   Keep both terminals running. Copy the generated `https://<random-name>.trycloudflare.com` URL.

3. In your hosted environment (for example **Vercel → Project Settings → Environment Variables** for the `api` service), set `AI_SERVICE_URL` to that `https://...trycloudflare.com` URL (not `http://127.0.0.1:8000`) and **redeploy**.

Quick Tunnel URLs change every time `cloudflared` restarts, so update `AI_SERVICE_URL` and redeploy whenever you restart the tunnel (or use a Cloudflare Named Tunnel if you have a domain on Cloudflare for a stable URL). Because this prototype has no built-in authentication, only leave the tunnel running while needed or place access controls in front of it.

## Checks

```bash
uv run pytest -q
uv run ruff check .
```

These tests cover input decoding and bounds, not model accuracy. Training datasets, checkpoints and exported model artifacts belong in the independent training/artifact workflow and must not be committed to the web application.
