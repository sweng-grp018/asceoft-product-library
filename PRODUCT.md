# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Store staff (primary):** work at a shelf with a phone or camera photo. They upload shelf photographs, want to know which indexed SKUs appear in the shot, inspect how confident each match is, and correct wrong matches so history stays useful.
- **Administrators:** maintain the SKU catalog and reference photos, trigger and retry indexing, manage staff accounts, and review corrections. Confirmed from README and `src/modules/*` feature slices.
- **Public visitors:** unauthenticated users who search catalog metadata by name, brand or SKU; no self-registration exists.

## Product Purpose

Lensistry is a standalone AI-powered product/SKU catalog and shelf-photo identification proof of concept for STSWENG Group 18 (DLSU). Administrators keep a catalog with reference images; staff turn a shelf photo into detected objects matched against indexed SKUs; visitors can search catalog metadata. Success means staff can go from photo to a trustworthy, correctable answer quickly, and admins can keep the catalog and its index healthy — without depending on Skaffld CORE.

## Positioning

Identification combines a general-purpose YOLO11 detector for candidate objects with OpenCLIP embeddings of each crop compared against the catalog's own indexed reference embeddings, with an explicit unknown fallback and manual correction stored separately from the AI prediction. The catalog, identity, database and object storage are owned by this standalone app; Skaffld CORE integration is future, versioned work.

## Operating Context

- Academic/client project: DLSU–Manila, College of Computer Studies, STSWENG Group 18, Term 1 A.Y. 2026–2027; client-approved stack.
- Delivery is **local now, hosted later**: developers run Docker Compose PostgreSQL (host port 5433) and MinIO (9000/9001), Express API on 4000, Next.js on 3000, FastAPI on 8000. A hosted deployment is expected eventually, so hosting, TLS, CORS, private-bucket and domain-origin constraints should not be designed away.
- Gitflow: `feature/*` from `development`, PRs back to `development`, protected `main`/`development`, CI plus review required.
- Inference is synchronous and intentional for the POC; training, durable queues and batch evaluation are not implemented.
- Team roles span Product Owner, Analyst, Developer, QA and Ops.

## Capabilities and Constraints

Confirmed capabilities: public catalog search by name/brand/SKU; NextAuth credentials CMS sign-in with admin-managed staff users; admin-only product CRUD with reference photos and indexing states; staff/admin shelf photo upload, YOLO detection, OpenCLIP similarity matching and search history; unknown detections, bounding-box coordinates, similarity scores and manual corrections; role checks enforced by Express (ADMIN/STAFF/PUBLIC).

Confirmed constraints:

- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Radix-backed shadcn/ui; Express 5 + Zod; PostgreSQL 18 + Prisma 7 with reviewed migrations; S3-compatible private storage with presigned uploads; Python 3.11–3.13 FastAPI/PyTorch/Ultralytics YOLO11/OpenCLIP ViT-B/32.
- Images: JPEG/PNG/WebP, 10 MiB each; validate media signatures and sizes; credentials stay server-side.
- JWT issuer/audience/expiry validation plus database role rechecks; no privileged operation may rely on hidden UI.
- Cosine similarity is **not** a calibrated probability; similarity below `0.78` yields Unknown and that threshold is an uncalibrated heuristic. Embeddings are versioned; incompatible model IDs must be rejected.
- Indexing is not model training. Text embeddings / semantic natural-language search are not implemented (text search is substring matching).
- Synchronous inference only; no Celery/Redis until measurements justify it.
- Standalone operation: no Skaffld CORE dependency, no direct coupling, no sync/identity mapping yet.

Explicitly undecided: hosted deployment target/provider and its security configuration; POC acceptance gates (proposed detector `mAP@0.5 ≥ 0.75`, recall `≥ 0.80`, top-1 accuracy `≥ 0.90`, unknown false acceptance `≤ 5%` — none measured and none client-confirmed); whether and when a vector index, durable queue, or trained product detector is added.

## Brand Commitments

- Name: **Lensistry**.
- Tagline: **“See it. Search it. Know it.”**
- License: proprietary / all rights reserved.
- No other binding identity assets, voice rules, or visual references were confirmed.

## Evidence on Hand

- Product truth lives in `README.md` and `AGENTS.md`; the codebase implements the described routes and feature slices.
- **No real assets yet:** no product photography, catalog records, shelf-photo dataset, testimonials, accuracy benchmarks, press or client quotations exist for use in UI or marketing. Future work must not fabricate them and must label placeholders.
- `public/images/` contains four illustrative chip-packet images used by the current interface; they are not evidence of catalog data or model accuracy.

## Product Principles

1. **Optimize the staff identification loop first.** Photo → detections → ranked matches → correction is the core job; every other surface supports it.
2. **Never dress similarity up as certainty.** Unknown is a legitimate result, scores are labeled honestly, and manual correction is a first-class outcome.
3. **Keep the catalog standalone.** Skaffld CORE integration arrives only as versioned API work with deliberate SKU/identity mapping.
4. **Respect the committed stack and boundaries.** Express owns data, credentials, storage and privileged operations; Next.js is the browser entry; Python is inference-only.
5. **Earn claims with evidence.** No accuracy, deployment or completeness claim ships until verified on representative data.
