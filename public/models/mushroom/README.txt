Mushroom Scanner Model (Optional, Recommended)

This app's /scan-mushroom page will try to load a mushroom-specific model first:
  /models/mushroom/model.json
  /models/mushroom/metadata.json

If these files are not present, it falls back to a generic MobileNet model
(which can detect "mushroom" but is not reliable for exact mushroom types).

Fast way to get accurate phone-camera detection:
1) Train a Teachable Machine Image Project with your mushroom classes:
   Example classes:
   - Button Mushroom
   - Oyster Mushroom
   - Shiitake Mushroom
   - Lion's Mane
   - Death Cap
   - No mushroom   (important background/negative class)
2) Export -> TensorFlow.js
3) Copy the exported files into this folder:
   public/models/mushroom/
   so that model.json and metadata.json are available at runtime.

Tip: include 50-200 images per class with different lighting and angles.
