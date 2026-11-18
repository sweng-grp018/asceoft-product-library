# Browser inference handoff

## Separation of responsibilities

The web app manages authentication, the SKU catalog, optional image storage, history and manual corrections. The Express API remains responsible for authorization and validating persisted data. The Vercel deployment contains Next.js and Express only.

Training and fine-tuning run independently on the team's training machine or training platform. The user-facing browser downloads a versioned exported detector, runs it against a locally selected image, then maps output class IDs to catalog SKUs. A browser-only scan need not upload the photo. Saving a photo or scan history should be an explicit action.

This is the target architecture, not an implemented model runner. The current `/detection` screen uses fixture boxes and scores even when a photo is selected. The Python prototype is optional and is not part of browser inference.

## Required model handoff

Export the team's validated YOLO11 checkpoint to ONNX in the independent training environment. Record the exact exporter version and export options. The browser cannot directly load a PyTorch `.pt` checkpoint.

For an initial fixed-shape detection export, for example:

```python
from ultralytics import YOLO

detector = YOLO("path/to/best.pt")
detector.export(format="onnx", imgsz=640, batch=1, dynamic=False, nms=False)
```

This is an example configuration; confirm it against the actual model and runtime. Provide the following alongside the exported file:

- A versioned model identifier and SHA-256 checksum.
- The input tensor name, shape, dtype, color order, resize/letterbox behavior, padding value and normalization.
- The output tensor names/shapes and layout, box format and coordinate space, score semantics, and whether NMS is included. Do not assume all YOLO exports have the same layout.
- A complete ordered mapping from class ID to stable catalog SKU. A numeric class ID or display name is not a database product ID. Unmapped classes must remain unknown.
- Detection and NMS thresholds chosen using held-out validation images, plus representative images and expected outputs for comparing Python and browser inference.

If the fine-tuned classes already identify SKUs, OpenCLIP and server embedding indexing are not required for that workflow. If the detector only identifies generic objects, it cannot identify the catalog SKU without another matching step.

## Browser integration to implement

Use ONNX Runtime Web in a Client Component and load the runtime/model only on the detection screen. Run preprocessing, inference and postprocessing in a Web Worker to keep the interface responsive. Start with WASM as the compatibility path and evaluate WebGPU on supported devices. The selected exported model and its operators must work with the chosen execution provider.

Publish the model and manifest as static downloadable artifacts in object storage or a CDN, separate from server function bundles. Configure CORS, load progress, cache invalidation by version/checksum, cancellation and useful unsupported-device errors. Treat downloadable browser model weights as visible to the user.

Replace fixture detections with real results only after checking tensor formats, letterbox reversal, NMS, class mapping and parity with Python on the same images. Measure download size, load time, inference latency and memory on representative desktop and mobile devices. Do not label uncalibrated scores as probabilities.

Persisted browser results must be validated and authorized by Express. Include the model/manifest version and record client inference as client-supplied data. Never grant privileges or make trusted catalog changes based only on a local prediction.

## References

- [Ultralytics ONNX export](https://docs.ultralytics.com/integrations/onnx/)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
- [Execution providers and browser deployment](https://onnxruntime.ai/docs/tutorials/web/deploy.html)
