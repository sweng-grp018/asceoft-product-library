# Browser inference handoff

## Separation of responsibilities

The web app manages authentication, the SKU catalog, optional image storage, history and manual corrections. The Express API remains responsible for authorization and validating persisted data. The Vercel deployment contains Next.js and Express only.

Training and fine-tuning run independently on the team's training machine or training platform. The team's YOLO26n detector is trained on SKU-110K to locate generic products. The target browser workflow downloads a versioned exported detector, runs it against a locally selected image, crops the detected objects and passes those crops to a separate SKU-identification step. Detector class IDs are not catalog SKUs. A browser-only scan need not upload the photo. Saving a photo or scan history should be an explicit action.

This is the target architecture, not an implemented model runner. The current `/detection` screen uses fixture boxes and scores even when a photo is selected. The Python prototype is optional and is not part of browser inference.

## Required model handoff

Export the team's validated YOLO26n checkpoint to ONNX in the independent training environment. Record the exact exporter version and export options and verify that the exported operators work with the chosen browser runtime. The browser cannot directly load a PyTorch `.pt` checkpoint. Provide the following alongside the exported file:

- A versioned model identifier and SHA-256 checksum.
- The input tensor name, shape, dtype, color order, resize/letterbox behavior, padding value and normalization.
- The output tensor names/shapes and layout, box format and coordinate space, score semantics, and whether the export requires NMS or produces final detections. Do not assume all YOLO exports have the same layout.
- Detector class meanings and the crop-to-SKU identification contract: crop preprocessing, identification model or matching method, model/reference versions, stable catalog SKU mapping and unknown-match behavior.
- Detection and matching thresholds chosen using held-out validation images, plus representative images and expected outputs for comparing Python and browser inference. Include NMS settings only when the export requires it.

SKU-110K supplies generic object boxes rather than per-SKU labels. The detector therefore requires a separate identification step that takes each crop and returns a catalog SKU or Unknown. The optional legacy prototype uses OpenCLIP embeddings for matching; that does not establish a browser identification implementation.

## Browser integration to implement

Use ONNX Runtime Web in a Client Component and load the runtime/model only on the detection screen. Run preprocessing, inference and postprocessing in a Web Worker to keep the interface responsive. Start with WASM as the compatibility path and evaluate WebGPU on supported devices. The selected exported model and its operators must work with the chosen execution provider.

Publish the model and manifest as static downloadable artifacts in object storage or a CDN, separate from server function bundles. Configure CORS, load progress, cache invalidation by version/checksum, cancellation and useful unsupported-device errors. Treat downloadable browser model weights as visible to the user.

Replace fixture detections with real results only after checking tensor formats, letterbox reversal, crop coordinates, any required NMS, SKU identification and parity with Python on the same images. Measure download size, load time, inference latency and memory on representative desktop and mobile devices. Do not label uncalibrated scores as probabilities.

Persisted browser results must be validated and authorized by Express. Include the model/manifest version and record client inference as client-supplied data. Never grant privileges or make trusted catalog changes based only on a local prediction.

## References

- [Ultralytics ONNX export](https://docs.ultralytics.com/integrations/onnx/)
- [SKU-110K dataset and labels](https://docs.ultralytics.com/datasets/detect/sku-110k/)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
- [Execution providers and browser deployment](https://onnxruntime.ai/docs/tutorials/web/deploy.html)
