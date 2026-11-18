# Standalone AI prototype

This directory is an independent Python project. It is excluded from the Vercel web deployment, is not started by `bun run dev:all`, and has its own CI workflow. You can install and run it without the Next.js app, Express API, PostgreSQL or S3.

The existing FastAPI code is a legacy inference prototype: generic YOLO11 detection plus OpenCLIP embeddings. It does not train or fine-tune models. The intended product path is independent training/export followed by inference in the user's browser. See [the browser inference handoff](../docs/browser-inference.md).

## Optional local prototype

Use Python 3.11–3.13 and uv. From this directory:

```bash
uv sync --extra dev
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
```

`GET /health` checks the service. `POST /embed` and `POST /detect` accept a JSON `imageBase64` value. Weights download on first inference. Set `YOLO_WEIGHTS` in this process to select a compatible detector checkpoint. Its class labels are not currently used for SKU mapping; the legacy API still matches OpenCLIP embeddings.

To exercise the legacy Express workflows locally, explicitly set `AI_SERVICE_URL=http://127.0.0.1:8000` in the web project's root `.env` and restart the API. Omit it for ordinary web development. The prototype has no service authentication and should stay bound to loopback for local experimentation.

## Checks

```bash
uv run pytest -q
uv run ruff check .
```

These tests cover input decoding and bounds, not model accuracy. Training datasets, checkpoints and exported model artifacts belong in the independent training/artifact workflow and must not be committed to the web application.
