import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { IoArrowBack, IoInformationCircleOutline } from "react-icons/io5";
import "@google/model-viewer";
import mushImg11 from "../../assets/menu/mush-11.jpg";
import mushImg12 from "../../assets/menu/mush-12.jpg";
import mushImg13 from "../../assets/menu/mush-13.jpg";
import mushImg14 from "../../assets/menu/mush-14.jpg";
import { arAPI } from "../../services/api";
import "./MushroomAR.css";

const DEFAULT_MODEL_SRC =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Mushrooms/glTF-Binary/Mushrooms.glb";

const SKETCHFAB = {
  buttonMushroomEmbed:
    "https://sketchfab.com/models/0a439e73ca1249178bd24f841a3cb656/embed?autostart=1&preload=1&ui_theme=dark&ui_watermark=0&ui_watermark_link=0",
  oysterMushroomEmbed:
    "https://sketchfab.com/models/8a96b4a7a60a4297a6db755582455e0a/embed?autostart=1&preload=1&ui_theme=dark&ui_watermark=0&ui_watermark_link=0",
  shiitakeMushroomEmbed:
    "https://sketchfab.com/models/87b7ac586c32452c9c807f36ccd7729c/embed?autostart=1&preload=1&ui_theme=dark&ui_watermark=0&ui_watermark_link=0",
};

const MUSHROOM_CATALOG = [
  {
    name: "Button Mushroom",
    type: "Edible, Cultivated",
    safety: "safe",
    markerKey: "button",
    markerImg: mushImg11,
    benefits: ["Boosts immunity", "Supports heart health", "Rich in antioxidants"],
    modelSrc: DEFAULT_MODEL_SRC,
    sketchfabEmbedUrl: SKETCHFAB.buttonMushroomEmbed,
  },
  {
    name: "Oyster Mushroom",
    type: "Edible, Cultivated",
    safety: "safe",
    markerKey: "oyster",
    markerImg: mushImg12,
    benefits: ["Supports heart health", "Rich in antioxidants", "May support immunity"],
    modelSrc: DEFAULT_MODEL_SRC,
    sketchfabEmbedUrl: SKETCHFAB.oysterMushroomEmbed,
  },
  {
    name: "Shiitake Mushroom",
    type: "Edible, Medicinal, Cultivated",
    safety: "safe",
    markerKey: "shiitake",
    markerImg: mushImg13,
    benefits: ["Boosts immunity", "Supports heart health", "Rich in antioxidants"],
    modelSrc: DEFAULT_MODEL_SRC,
    sketchfabEmbedUrl: SKETCHFAB.shiitakeMushroomEmbed,
  },
  {
    name: "Enoki Mushroom",
    type: "Edible, Cultivated",
    safety: "safe",
    markerKey: "enoki",
    markerImg: mushImg14,
    benefits: ["Supports immunity", "Rich in antioxidants", "Supports heart health"],
    modelSrc: DEFAULT_MODEL_SRC,
  },
  {
    name: "Lion's Mane",
    type: "Medicinal, Edible, Cultivated",
    safety: "safe",
  },
  {
    name: "Reishi",
    type: "Medicinal, Wild/Cultivated",
    safety: "not_safe",
  },
  {
    name: "Chanterelle",
    type: "Edible, Wild",
    safety: "safe",
  },
  {
    name: "Morel",
    type: "Edible, Wild",
    safety: "safe",
  },
  {
    name: "Death Cap",
    type: "Poisonous, Wild",
    safety: "not_safe",
  },
];

const CUSTOM_MODEL = {
  modelURL: `${process.env.PUBLIC_URL || ""}/models/mushroom/model.json`,
  metadataURL: `${process.env.PUBLIC_URL || ""}/models/mushroom/metadata.json`,
};

const SCAN_DURATION_MS = 2000;
const SCAN_INTERVAL_MS = 250;
const MARKER_PREFIX = "MUSHROOM:";

function argmax(arr) {
  let bestIdx = 0;
  let best = -Infinity;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > best) {
      best = arr[i];
      bestIdx = i;
    }
  }
  return bestIdx;
}

function softmax(logits) {
  const max = Math.max(...logits);
  const exps = logits.map((x) => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((x) => x / sum);
}

async function tryLoadCustomTfjsModel(tf) {
  const [modelRes, metaRes] = await Promise.all([
    fetch(CUSTOM_MODEL.modelURL, { cache: "no-store" }),
    fetch(CUSTOM_MODEL.metadataURL, { cache: "no-store" }),
  ]);

  if (!modelRes.ok || !metaRes.ok) return null;

  const metadata = await metaRes.json().catch(() => null);
  const labels = Array.isArray(metadata?.labels) ? metadata.labels : null;

  const model = await tf.loadLayersModel(CUSTOM_MODEL.modelURL);
  const inputShape = model?.inputs?.[0]?.shape || null; // [null, H, W, 3]
  const inputHeight = typeof inputShape?.[1] === "number" ? inputShape[1] : 224;
  const inputWidth = typeof inputShape?.[2] === "number" ? inputShape[2] : 224;

  return { model, labels, inputHeight, inputWidth };
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function normalizeModelUrl(raw, origin) {
  const v = String(raw || "").trim();
  if (!v) return "";
  try {
    const u = new URL(v);
    if (u.pathname.startsWith("/uploads/")) return new URL(u.pathname, origin).toString();
  } catch (e) {
    // ignore
  }
  try {
    return new URL(v, origin).toString();
  } catch (e) {
    return v;
  }
}

function pickTopEdgePoints(points) {
  const pts = Array.isArray(points) ? points.filter((p) => p && typeof p.x === "number" && typeof p.y === "number") : [];
  if (pts.length < 2) return null;
  const sorted = [...pts].sort((a, b) => (a.y - b.y) || (a.x - b.x));
  const a = sorted[0];
  const b = sorted[1];
  return a.x <= b.x ? { tl: a, tr: b } : { tl: b, tr: a };
}

function rectFromPoints(points) {
  const pts = Array.isArray(points) ? points : [];
  const xs = pts.map((p) => p?.x).filter((x) => typeof x === "number");
  const ys = pts.map((p) => p?.y).filter((y) => typeof y === "number");
  if (!xs.length || !ys.length) return null;
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  const w = Math.max(...xs) - x;
  const h = Math.max(...ys) - y;
  return { x, y, w: Math.max(0, w), h: Math.max(0, h) };
}

function mapIntrinsicRectToCoverElement(rect, vw, vh, elW, elH) {
  if (!rect || !vw || !vh || !elW || !elH) return null;
  const s = Math.max(elW / vw, elH / vh);
  const dw = vw * s;
  const dh = vh * s;
  const offX = (dw - elW) / 2;
  const offY = (dh - elH) / 2;
  const xEl = rect.x * s - offX;
  const yEl = rect.y * s - offY;
  const wEl = rect.w * s;
  const hEl = rect.h * s;
  return { xEl, yEl, wEl, hEl };
}

function overlayFromIntrinsicRect({ rect, points }, vw, vh, elW, elH) {
  const mapped = mapIntrinsicRectToCoverElement(rect, vw, vh, elW, elH);
  if (!mapped) return null;
  const { xEl, yEl, wEl, hEl } = mapped;

  const leftPct = clamp((xEl / elW) * 100, -20, 120);
  const topPct = clamp((yEl / elH) * 100, -20, 120);
  const widthPct = clamp((wEl / elW) * 100, 0, 160);
  const heightPct = clamp((hEl / elH) * 100, 0, 160);

  let rotDeg = 0;
  const edge = pickTopEdgePoints(points);
  if (edge) rotDeg = (Math.atan2(edge.tr.y - edge.tl.y, edge.tr.x - edge.tl.x) * 180) / Math.PI;

  const modelSizePx = clamp(Math.max(wEl, hEl) * 2.4, 160, 420);
  return { leftPct, topPct, widthPct, heightPct, rotDeg, modelSizePx };
}

function overlayAlmostSame(a, b) {
  if (!a || !b) return false;
  const near = (x, y, eps) => Math.abs(x - y) <= eps;
  return (
    near(a.leftPct, b.leftPct, 1.2) &&
    near(a.topPct, b.topPct, 1.2) &&
    near(a.widthPct, b.widthPct, 1.6) &&
    near(a.heightPct, b.heightPct, 1.6) &&
    near(a.rotDeg, b.rotDeg, 6) &&
    near(a.modelSizePx, b.modelSizePx, 18)
  );
}

function randomBetween(min, max, decimals = 0) {
  const value = min + Math.random() * (max - min);
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function generateDemoNutrition() {
  return {
    proteinG: randomBetween(3.1, 4.5, 1),
    fiberG: randomBetween(1.2, 2.0, 1),
    vitaminDDV: Math.round(randomBetween(5, 10, 0)),
    potassiumMg: Math.round(randomBetween(200, 350, 0)),
  };
}

function makeDetectedFromCatalogItem(item, { confidencePct = 96, notice = null, fallback = false } = {}) {
  return {
    ...item,
    confidencePct,
    nutrition: generateDemoNutrition(),
    debugLabel: item.markerKey || item.name,
    _score: clamp(confidencePct / 100, 0, 1),
    notice,
    fallback,
    modelSrc: item.modelSrc || null,
    sketchfabEmbedUrl: item.sketchfabEmbedUrl || null,
  };
}

function makeDetectedFromArDoc(doc, { confidencePct = 96, notice = null, fallback = false, nutrition = null } = {}) {
  const markerKey = doc?.markerKey || "";
  const name = doc?.name || "Mushroom";
  const type = doc?.typeLabel || doc?.type || "";
  const safety = doc?.safety || "safe";
  const benefits = Array.isArray(doc?.benefits) ? doc.benefits : [];
  const modelSrc = doc?.modelSrc || null;
  const sketchfabEmbedUrl = doc?.sketchfabEmbedUrl || null;

  return {
    markerKey,
    name,
    type,
    safety,
    benefits,
    modelSrc,
    sketchfabEmbedUrl,
    confidencePct,
    nutrition: nutrition || generateDemoNutrition(),
    debugLabel: markerKey || name,
    _score: clamp(confidencePct / 100, 0, 1),
    notice,
    fallback,
  };
}

function normalizeMarkerValue(rawValue) {
  const v = String(rawValue || "").trim();
  if (!v) return "";
  const upper = v.toUpperCase();
  if (upper.startsWith(MARKER_PREFIX)) return upper.slice(MARKER_PREFIX.length).trim().toLowerCase();
  return v.toLowerCase().trim();
}

function extractMarkerKeyFromMarkerValue(rawValue, knownKeysSet) {
  const key = normalizeMarkerValue(rawValue);
  if (!key) return "";
  if (knownKeysSet && typeof knownKeysSet.has === "function" && !knownKeysSet.has(key)) return "";
  return key;
}

function estimateBarcodeArea(barcode) {
  const bb = barcode?.boundingBox;
  if (bb && typeof bb.width === "number" && typeof bb.height === "number") {
    return Math.max(0, bb.width) * Math.max(0, bb.height);
  }
  const pts = barcode?.cornerPoints;
  if (Array.isArray(pts) && pts.length >= 2) {
    const xs = pts.map((p) => p?.x).filter((x) => typeof x === "number");
    const ys = pts.map((p) => p?.y).filter((y) => typeof y === "number");
    if (xs.length && ys.length) {
      const w = Math.max(...xs) - Math.min(...xs);
      const h = Math.max(...ys) - Math.min(...ys);
      return Math.max(0, w) * Math.max(0, h);
    }
  }
  return 0;
}

function pickCatalogItemByHint(hint) {
  const normalized = (hint || "").toLowerCase();
  const byKeyword = [
    { k: ["oyster"], i: 1 },
    { k: ["shiitake"], i: 2 },
    { k: ["enoki"], i: 3 },
    { k: ["lion", "mane"], i: 4 },
    { k: ["reishi"], i: 5 },
    { k: ["chanterelle"], i: 6 },
    { k: ["morel"], i: 7 },
    { k: ["death cap", "amanita"], i: 8 },
    { k: ["agaric", "mushroom", "fungus"], i: 0 },
    // Common MobileNet confusions for white button mushrooms shown on screens.
    { k: ["ping-pong", "golf ball", "tennis ball", "egg", "dumpling", "button"], i: 0 },
  ];

  for (const rule of byKeyword) {
    if (rule.k.some((w) => normalized.includes(w))) {
      return MUSHROOM_CATALOG[rule.i];
    }
  }

  // If we didn't recognize the label but it's likely a mushroom, pick a common edible one for demo.
  return MUSHROOM_CATALOG[Math.floor(Math.random() * 4)];
}

function inferMushroomFromPredictions(predictions) {
  if (!Array.isArray(predictions) || predictions.length === 0) return null;

  // MobileNet can put "mushroom" related labels at rank 2-5, and "button mushrooms"
  // frequently show up as ball/egg-like objects. Look across the whole list.
  let best = null;
  for (const p of predictions) {
    if (!p || typeof p.className !== "string" || typeof p.probability !== "number") continue;
    const label = p.className.toLowerCase();
    const prob = clamp(p.probability, 0, 1);

    const mushroomish =
      label.includes("mushroom") ||
      label.includes("agaric") ||
      label.includes("fungus") ||
      label.includes("bolete") ||
      label.includes("stinkhorn") ||
      label.includes("earthstar") ||
      label.includes("morel");

    const buttonish =
      label.includes("ping-pong") ||
      label.includes("golf ball") ||
      label.includes("tennis ball") ||
      label.includes("egg") ||
      label.includes("dumpling") ||
      label.includes("button");

    const score = prob + (mushroomish ? 0.12 : 0) + (buttonish ? 0.08 : 0);
    if (!best || score > best.score) {
      best = { label, prob, score, rawLabel: p.className, mushroomish, buttonish };
    }
  }

  if (!best) return null;

  // If it looks mushroom-ish or button-mushroom-ish, treat as detected.
  if (!best.mushroomish && !best.buttonish) return null;

  const item = pickCatalogItemByHint(best.label);
  const confidencePct = Math.round(best.prob * 100);

  return {
    ...item,
    // Keep demo confidence readable, but don't force it to 70% anymore.
    confidencePct: Math.max(40, confidencePct),
    nutrition: generateDemoNutrition(),
    debugLabel: best.rawLabel,
    _score: best.prob,
  };
}

function makeFallbackDetected() {
  // Show a believable demo card even when nothing is detected, as requested.
  const safeDefaults = MUSHROOM_CATALOG.filter((m) => m.safety === "safe");
  const pickFrom = safeDefaults.length > 0 ? safeDefaults : MUSHROOM_CATALOG;
  const item = pickFrom[Math.floor(Math.random() * Math.max(1, pickFrom.length))] || MUSHROOM_CATALOG[0];

  return makeDetectedFromCatalogItem(item, {
    confidencePct: Math.round(randomBetween(42, 58, 0)),
    fallback: true,
    notice: "No mushroom marker detected. Showing sample details for demo.",
  });
}

const MushroomAR = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const modelRef = useRef(null);
  const markerDetectorRef = useRef(null);
  const qrDecodeRef = useRef(null);
  const qrCanvasRef = useRef(null);
  const qrCtxRef = useRef(null);
  const scanTimerRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const stageTimeoutRef = useRef(null);
  const historyRef = useRef([]); // [{ label, prob }]
  const bestCandidateRef = useRef(null);
  const scanStartMsRef = useRef(0);
  const scanInFlightRef = useRef(false);
  const markerStatsRef = useRef({}); // { [markerKey]: { count: number, bestArea: number } }
  const bestMarkerKeyRef = useRef(null);
  const arCatalogMapRef = useRef({}); // { [markerKey]: ArMushroom }
  const knownMarkerKeysRef = useRef(new Set()); // Set<string>

  const [cameraStatus, setCameraStatus] = useState("idle"); // idle | loading | ready | error
  const [modelStatus, setModelStatus] = useState("idle"); // idle | loading | ready | error
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [detected, setDetected] = useState(null);
  const [resultStage, setResultStage] = useState("none"); // none | name | card
  // Markers should be shown on the laptop "marker board" page, not on the scanning phone by default.
  const [showMarkers, setShowMarkers] = useState(false);
  const [markerDataUrls, setMarkerDataUrls] = useState({});
  const [markerStatus, setMarkerStatus] = useState("idle"); // idle | ready | unsupported
  const [resolved3d, setResolved3d] = useState({ kind: "none", src: null }); // none | model-viewer | sketchfab
  const [arCatalogStatus, setArCatalogStatus] = useState("idle"); // idle | loading | ready | error
  const [markerOverlay, setMarkerOverlay] = useState(null); // { leftPct, topPct, widthPct, heightPct, rotDeg, modelSizePx }
  const [trackedMarkerKey, setTrackedMarkerKey] = useState("");

  const lastOverlayRef = useRef(null);
  const lastMarkerSeenMsRef = useRef(0);
  const trackedMarkerKeyRef = useRef("");

  const markerItems = useMemo(
    () => MUSHROOM_CATALOG.filter((m) => m.markerKey && m.markerImg).slice(0, 4),
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!detected) {
        setResolved3d({ kind: "none", src: null });
        return;
      }

      // Prefer Sketchfab for Button Mushroom for an instant interactive preview.
      if (!cancelled && detected.sketchfabEmbedUrl) {
        setResolved3d({ kind: "sketchfab", src: detected.sketchfabEmbedUrl });
        return;
      }

      if (!cancelled && detected.modelSrc) {
        setResolved3d({ kind: "model-viewer", src: detected.modelSrc });
        return;
      }

      if (!cancelled) setResolved3d({ kind: "none", src: null });
    })();

    return () => {
      cancelled = true;
    };
  }, [detected]);

  useEffect(() => {
    return () => {
      if (stageTimeoutRef.current) window.clearTimeout(stageTimeoutRef.current);
      stageTimeoutRef.current = null;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      let ok = false;

      try {
        if (typeof window !== "undefined" && "BarcodeDetector" in window) {
          markerDetectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] });
          ok = true;
        }
      } catch (e) {
        markerDetectorRef.current = null;
      }

      // Fallback QR decoder for browsers without BarcodeDetector (common on some Android/iOS builds).
      try {
        const mod = await import("jsqr");
        qrDecodeRef.current = mod.default || mod;
        ok = true;
      } catch (e) {
        qrDecodeRef.current = null;
      }

      if (mounted) setMarkerStatus(ok ? "ready" : "unsupported");
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setArCatalogStatus("loading");
      try {
        const res = await arAPI.getAllMushrooms();
        const items = Array.isArray(res?.data) ? res.data : [];
        if (!mounted) return;

        const map = {};
        const keys = new Set();
        for (const it of items) {
          if (it?.markerKey) {
            map[it.markerKey] = it;
            keys.add(it.markerKey);
          }
        }

        // Fallback to the built-in marker keys if the DB is empty/unavailable.
        if (keys.size === 0) {
          ["button", "oyster", "shiitake", "enoki"].forEach((k) => keys.add(k));
        }

        arCatalogMapRef.current = map;
        knownMarkerKeysRef.current = keys;
        setArCatalogStatus("ready");
      } catch (e) {
        if (!mounted) return;
        ["button", "oyster", "shiitake", "enoki"].forEach((k) => knownMarkerKeysRef.current.add(k));
        setArCatalogStatus("error");
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import("qrcode");
        const QRCode = mod.default || mod;
        const out = {};
        for (const item of markerItems) {
          const payload = `${MARKER_PREFIX}${String(item.markerKey).toUpperCase()}`;
          out[item.markerKey] = await QRCode.toDataURL(payload, {
            errorCorrectionLevel: "M",
            margin: 1,
            width: 220,
            color: { dark: "#0b0b0e", light: "#ffffff" },
          });
        }
        if (mounted) setMarkerDataUrls(out);
      } catch (e) {
        // If QR generation fails, users can still use any external QR generator with the payloads.
      }
    })();

    return () => {
      mounted = false;
    };
  }, [markerItems]);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      setCameraStatus("loading");
      setScanMessage("");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setCameraStatus("ready");
      } catch (err) {
        console.error("Camera error:", err);
        setCameraStatus("error");
        const isSecure = typeof window !== "undefined" ? window.isSecureContext : true;
        const host = typeof window !== "undefined" ? window.location.hostname : "";
        if (!isSecure && host !== "localhost") {
          setScanMessage("Camera needs HTTPS on mobile. Start with HTTPS and open https://<PC_IP>:3000/scan-mushroom.");
        } else {
          setScanMessage("Camera permission denied or unavailable. Please allow camera access in your browser settings.");
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      if (scanTimerRef.current) window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
      if (scanTimeoutRef.current) window.clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      setModelStatus("loading");
      try {
        const tf = await import("@tensorflow/tfjs");

        // Prefer a mushroom-specific TFJS model if present:
        // public/models/mushroom/model.json + metadata.json (Teachable Machine export works)
        try {
          const custom = await tryLoadCustomTfjsModel(tf);
          if (custom) {
            if (cancelled) return;
            modelRef.current = { kind: "custom", ...custom };
            setModelStatus("ready");
            return;
          }
        } catch (e) {
          // Ignore and fall back to MobileNet.
        }

        // Fallback: generic classifier. It can detect "mushroom" but is not species-accurate.
        // Keep this as a backup so the feature still works without a custom model.
        await tf.ready();
        const mobilenet = await import("@tensorflow-models/mobilenet");
        const model = await mobilenet.load({ version: 2, alpha: 1.0 });
        if (cancelled) return;
        modelRef.current = { kind: "mobilenet", model };
        setModelStatus("ready");
      } catch (err) {
        console.error("Model load error:", err);
        if (cancelled) return;
        setModelStatus("error");
        setScanMessage("Failed to load the detection model. Please refresh and try again.");
      }
    }

    loadModel();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const canScan = cameraStatus === "ready" && modelStatus === "ready" && !!videoRef.current;
    if (!canScan) return;

    // Do not auto-start scanning; user taps "Scan Mushroom".
  }, [cameraStatus, modelStatus]);

  useEffect(() => {
    const canScan =
      isScanning &&
      cameraStatus === "ready" &&
      !!videoRef.current &&
      (markerStatus === "ready" || modelStatus === "ready");
    if (!canScan) return;

    scanStartMsRef.current = Date.now();
    historyRef.current = [];
    bestCandidateRef.current = null;
    markerStatsRef.current = {};
    bestMarkerKeyRef.current = null;
    lastMarkerSeenMsRef.current = 0;
    lastOverlayRef.current = null;
    trackedMarkerKeyRef.current = "";
    setTrackedMarkerKey("");
    setMarkerOverlay(null);

    const scanMode = markerStatus === "ready" ? "marker" : "ai";
    setScanMessage(
      scanMode === "marker"
        ? "Scanning... (2 seconds) Point at a mushroom marker (QR card)."
        : "Scanning... (2 seconds) Marker scanning not available, using AI detection."
    );

    scanTimerRef.current = window.setInterval(async () => {
      try {
        if (scanInFlightRef.current) return;
        scanInFlightRef.current = true;

        const videoEl = videoRef.current;
        const modelWrap = modelRef.current;
        if (!videoEl) return;

        // Marker-based detection (preferred). If multiple QRs are visible, pick the most prominent one.
        let markerValue = null;
        let markerArea = 0;
        let intrinsicRect = null;
        let intrinsicPoints = null;
        if (markerDetectorRef.current) {
          const barcodes = await markerDetectorRef.current.detect(videoEl);
          const candidate = Array.isArray(barcodes)
            ? barcodes
                .filter((b) => b && b.rawValue)
                .sort((a, b) => estimateBarcodeArea(b) - estimateBarcodeArea(a))[0]
            : null;
          markerValue = candidate?.rawValue || null;
          markerArea = candidate ? estimateBarcodeArea(candidate) : 0;

          if (candidate) {
            const bb = candidate.boundingBox || null;
            const pts = Array.isArray(candidate.cornerPoints) ? candidate.cornerPoints : null;
            if (bb && (typeof bb.width === "number" || typeof bb.right === "number")) {
              const x = typeof bb.x === "number" ? bb.x : typeof bb.left === "number" ? bb.left : 0;
              const y = typeof bb.y === "number" ? bb.y : typeof bb.top === "number" ? bb.top : 0;
              const w =
                typeof bb.width === "number"
                  ? bb.width
                  : typeof bb.right === "number" && typeof bb.left === "number"
                    ? bb.right - bb.left
                    : 0;
              const h =
                typeof bb.height === "number"
                  ? bb.height
                  : typeof bb.bottom === "number" && typeof bb.top === "number"
                    ? bb.bottom - bb.top
                    : 0;
              intrinsicRect = { x, y, w: Math.max(0, w), h: Math.max(0, h) };
              intrinsicPoints = pts;
            } else if (pts) {
              intrinsicRect = rectFromPoints(pts);
              intrinsicPoints = pts;
            }
          }
        } else if (qrDecodeRef.current) {
          const vw = videoEl.videoWidth;
          const vh = videoEl.videoHeight;
          if (vw && vh) {
            const targetW = Math.min(640, vw);
            const targetH = Math.round((targetW * vh) / vw);
            const canvas = qrCanvasRef.current;
            if (canvas) {
              canvas.width = targetW;
              canvas.height = targetH;
              if (!qrCtxRef.current) qrCtxRef.current = canvas.getContext("2d", { willReadFrequently: true });
              const ctx = qrCtxRef.current;
              if (ctx) {
                ctx.drawImage(videoEl, 0, 0, targetW, targetH);
                const imgData = ctx.getImageData(0, 0, targetW, targetH);
                const code = qrDecodeRef.current(imgData.data, targetW, targetH);
                markerValue = code?.data || null;

                const loc = code?.location || null;
                if (loc) {
                  const ptsCanvas = [loc.topLeftCorner, loc.topRightCorner, loc.bottomRightCorner, loc.bottomLeftCorner].filter(Boolean);
                  const rectCanvas = rectFromPoints(ptsCanvas);
                  if (rectCanvas) {
                    intrinsicRect = {
                      x: (rectCanvas.x * vw) / targetW,
                      y: (rectCanvas.y * vh) / targetH,
                      w: (rectCanvas.w * vw) / targetW,
                      h: (rectCanvas.h * vh) / targetH,
                    };
                    intrinsicPoints = ptsCanvas.map((p) => ({ x: (p.x * vw) / targetW, y: (p.y * vh) / targetH }));
                    markerArea = rectCanvas.w * rectCanvas.h;
                  }
                }
              }
            }
          }
        }

        // Update marker overlay (QR box + 3D preview anchored above it).
        const vw = videoEl.videoWidth;
        const vh = videoEl.videoHeight;
        const elW = videoEl.clientWidth;
        const elH = videoEl.clientHeight;
        if (intrinsicRect && vw && vh && elW && elH) {
          const overlay = overlayFromIntrinsicRect({ rect: intrinsicRect, points: intrinsicPoints }, vw, vh, elW, elH);
          if (overlay) {
            lastMarkerSeenMsRef.current = Date.now();
            const prev = lastOverlayRef.current;
            if (!overlayAlmostSame(prev, overlay)) {
              lastOverlayRef.current = overlay;
              setMarkerOverlay(overlay);
            }
          }
        } else if (Date.now() - (lastMarkerSeenMsRef.current || 0) > 800 && lastOverlayRef.current) {
          lastOverlayRef.current = null;
          setMarkerOverlay(null);
        }

        if (markerValue) {
          const markerKey = extractMarkerKeyFromMarkerValue(markerValue, knownMarkerKeysRef.current);
          if (markerKey) {
            if (trackedMarkerKeyRef.current !== markerKey) {
              trackedMarkerKeyRef.current = markerKey;
              setTrackedMarkerKey(markerKey);
            }
            const stats = markerStatsRef.current[markerKey] || { count: 0, bestArea: 0 };
            stats.count += 1;
            stats.bestArea = Math.max(stats.bestArea, markerArea || 0);
            markerStatsRef.current[markerKey] = stats;

            // Determine best marker seen so far (by count, then by area).
            let bestKey = null;
            let bestCount = -1;
            let bestArea = -1;
            for (const [k, s] of Object.entries(markerStatsRef.current)) {
              if (s.count > bestCount || (s.count === bestCount && s.bestArea > bestArea)) {
                bestKey = k;
                bestCount = s.count;
                bestArea = s.bestArea;
              }
            }
            bestMarkerKeyRef.current = bestKey;
          }
        }

        // If marker scanning is available, we do not need heavy AI inference for the demo flow.
        // We will show DB-backed details even if no marker is detected (fallback behavior).
        if (markerStatus === "ready") return;

        if (!modelWrap) return;

        let predictions = [];
        if (modelWrap.kind === "custom") {
          const tf = await import("@tensorflow/tfjs");
          const { model, inputHeight, inputWidth, labels } = modelWrap;

          // Preprocess to match the common MobileNet-style training pipeline used by many TM exports.
          const outTensor = tf.tidy(() => {
            const pixels = tf.browser.fromPixels(videoEl);
            const resized = tf.image.resizeBilinear(pixels, [inputHeight, inputWidth], true);
            const normalized = resized.toFloat().div(127.5).sub(1);
            const batched = normalized.expandDims(0);
            const out = model.predict(batched);
            const tensor = Array.isArray(out) ? out[0] : out;
            return tensor.squeeze();
          });

          const data = await outTensor.data();
          outTensor.dispose();

          // If output isn't already probabilities, softmax it.
          const arr = Array.from(data);
          const sum = arr.reduce((a, b) => a + b, 0);
          const probs = sum > 0.99 && sum < 1.01 ? arr : softmax(arr);

          const bestIdx = argmax(probs);
          const className = Array.isArray(labels) && labels[bestIdx] ? labels[bestIdx] : `Class ${bestIdx}`;
          predictions = [{ className, probability: probs[bestIdx] }];
        } else {
          // MobileNet classify works on HTMLVideoElement directly.
          predictions = await modelWrap.model.classify(videoEl, 5);
        }

        // Normalize + sort (some models don't guarantee ordering).
        predictions = predictions
          .filter((p) => p && typeof p.className === "string" && typeof p.probability === "number")
          .sort((a, b) => b.probability - a.probability);

        const top = predictions[0];

        let result = null;
        if (modelWrap.kind === "custom") {
          const label = (top?.className || "").trim();
          const prob = top?.probability ?? 0;
          const looksEmpty =
            label.toLowerCase().includes("no mushroom") ||
            label.toLowerCase().includes("background") ||
            label.toLowerCase().includes("none");

          if (!looksEmpty) {
            const catalogHit = MUSHROOM_CATALOG.find((m) => m.name.toLowerCase() === label.toLowerCase());
            result = {
              ...(catalogHit || { name: label, type: "Unknown (Demo)", safety: "not_safe" }),
              confidencePct: Math.round(clamp(prob, 0, 1) * 100),
              nutrition: generateDemoNutrition(),
              debugLabel: label,
              _score: clamp(prob, 0, 1),
            };
          }
        } else {
          result = inferMushroomFromPredictions(predictions);
        }

        // Stability smoothing: prefer stable results, but we still finalize after 2s no matter what.
        if (result) {
          const labelKey = (result.debugLabel || result.name || "").toLowerCase();
          const probKey = clamp((result.confidencePct || 0) / 100, 0, 1);

          historyRef.current.push({ label: labelKey, prob: probKey });
          if (historyRef.current.length > 6) historyRef.current.shift();

          const last = historyRef.current.slice(-4);
          const sameLabelCount = last.filter((h) => h.label === labelKey).length;
          const avgProb =
            last.reduce((sum, h) => sum + (h.label === labelKey ? h.prob : 0), 0) /
            Math.max(1, last.filter((h) => h.label === labelKey).length);

          const boostedScore = clamp((result._score ?? 0) + (sameLabelCount >= 3 ? 0.06 : 0) + (avgProb >= 0.72 ? 0.06 : 0), 0, 1);
          const best = bestCandidateRef.current;
          if (!best || boostedScore > (best._score ?? 0)) {
            bestCandidateRef.current = { ...result, _score: boostedScore };
          }
        }
      } catch (err) {
        console.error("Scan error:", err);
        // Keep the scan session running; we'll fall back to an error card at finalize if needed.
      } finally {
        scanInFlightRef.current = false;
      }
    }, SCAN_INTERVAL_MS);

    scanTimeoutRef.current = window.setTimeout(() => {
      (async () => {
        const bestMarkerKey = bestMarkerKeyRef.current;

        // If we have a marker result, load full details from DB and store the scan server-side.
        if (bestMarkerKey) {
          const stats = markerStatsRef.current?.[bestMarkerKey] || { count: 1, bestArea: 0 };
          const estConfidence = clamp(74 + stats.count * 4, 74, 99);

          const doc = arCatalogMapRef.current?.[bestMarkerKey];
          const quick = doc
            ? makeDetectedFromArDoc(doc, { confidencePct: estConfidence })
            : makeDetectedFromCatalogItem(MUSHROOM_CATALOG[0], { confidencePct: estConfidence });

          setDetected(quick);
          setScanMessage("");

          setResultStage("name");
          if (stageTimeoutRef.current) window.clearTimeout(stageTimeoutRef.current);
          stageTimeoutRef.current = window.setTimeout(() => setResultStage("card"), 420);

          setIsScanning(false);

          try {
            const res = await arAPI.scan({
              markerKey: bestMarkerKey,
              confidencePct: estConfidence,
              source: "marker",
            });
            const data = res?.data;
            if (res?.success && data) {
              setDetected(
                makeDetectedFromArDoc(data, {
                  confidencePct: typeof data.confidencePct === "number" ? data.confidencePct : estConfidence,
                  nutrition: data.nutrients,
                })
              );
            }
          } catch (e) {
            // Keep the quick card visible even if the DB call fails.
            setDetected((prev) =>
              prev
                ? {
                    ...prev,
                    notice: prev.notice || "Saved scan locally for demo. Backend was not reachable.",
                  }
                : prev
            );
          }

          return;
        }

        // Otherwise: AI (if available) or fallback, then still store a scan in DB using a known markerKey.
        const best = bestCandidateRef.current;
        const minScore = modelRef.current?.kind === "custom" ? 0.55 : 0.25;
        const finalResult = best && (best._score ?? 0) >= minScore ? best : makeFallbackDetected();

        setDetected(finalResult);
        setScanMessage("");

        setResultStage("name");
        if (stageTimeoutRef.current) window.clearTimeout(stageTimeoutRef.current);
        stageTimeoutRef.current = window.setTimeout(() => setResultStage("card"), 420);

        setIsScanning(false);

        const known = knownMarkerKeysRef.current;
        const storeKey =
          finalResult?.markerKey && known && typeof known.has === "function" && known.has(finalResult.markerKey)
            ? finalResult.markerKey
            : "button";

        try {
          const res = await arAPI.scan({
            markerKey: storeKey,
            confidencePct: typeof finalResult?.confidencePct === "number" ? finalResult.confidencePct : null,
            source: finalResult?.fallback ? "fallback" : "ai",
          });
          const data = res?.data;
          if (res?.success && data) {
            // Keep the existing notice (e.g. "No marker detected...") but upgrade details from DB.
            setDetected((prev) => {
              const upgraded = makeDetectedFromArDoc(data, {
                confidencePct: typeof data.confidencePct === "number" ? data.confidencePct : prev?.confidencePct || 55,
                nutrition: data.nutrients,
              });
              if (prev?.notice) upgraded.notice = prev.notice;
              if (prev?.fallback) upgraded.fallback = true;
              return upgraded;
            });
          }
        } catch (e) {
          // If DB is down, we still show the on-device demo card.
        }
      })();
    }, SCAN_DURATION_MS);

    return () => {
      if (scanTimerRef.current) window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
      if (scanTimeoutRef.current) window.clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    };
  }, [isScanning, cameraStatus, modelStatus, markerStatus]);

  const handleScanAgain = () => {
    setDetected(null);
    setScanMessage("");
    setResultStage("none");
    if (stageTimeoutRef.current) window.clearTimeout(stageTimeoutRef.current);
    stageTimeoutRef.current = null;
    const canStart = cameraStatus === "ready" && (markerStatus === "ready" || modelStatus === "ready");
    if (canStart) {
      setShowMarkers(false);
      setIsScanning(true);
    } else {
      setScanMessage("Camera/model not ready yet. Please wait a moment.");
    }
  };

  const canStartScan = cameraStatus === "ready" && (markerStatus === "ready" || modelStatus === "ready");
  const showBusy = !canStartScan;
  const frameState = detected && !detected.fallback ? "found" : isScanning ? "scanning" : "idle";

  const trackedDoc = trackedMarkerKey ? arCatalogMapRef.current?.[trackedMarkerKey] : null;
  const overlayName = detected?.name || trackedDoc?.name || "";
  const overlayModelSrc = detected?.modelSrc || trackedDoc?.modelSrc || "";
  const overlayModelUrl = normalizeModelUrl(overlayModelSrc, window.location.origin);

  return (
    <div className="ar-page-container">
      <video
        ref={videoRef}
        className="ar-camera"
        playsInline
        muted
        autoPlay
      />
      <canvas ref={qrCanvasRef} className="ar-hidden-canvas" aria-hidden="true" />

      {markerOverlay ? (
        <div
          className="ar-qr-anchor"
          style={{
            left: `${markerOverlay.leftPct}%`,
            top: `${markerOverlay.topPct}%`,
            width: `${markerOverlay.widthPct}%`,
            height: `${markerOverlay.heightPct}%`,
          }}
          aria-hidden="true"
        >
          <div
            className={`ar-qr-anchor__box ${overlayName && detected && !detected.fallback ? "ar-qr-anchor__box--found" : ""}`}
            style={{ transform: `rotate(${markerOverlay.rotDeg}deg)` }}
          />
          {overlayName ? <div className="ar-qr-anchor__label">{overlayName}</div> : null}
          {overlayModelUrl ? (
            <model-viewer
              className="ar-qr-anchor__model"
              src={overlayModelUrl}
              alt={`${overlayName || "Mushroom"} 3D preview`}
              camera-controls
              auto-rotate
              shadow-intensity="0.6"
              rotation-per-second="24deg"
              loading="eager"
              style={{ width: `${markerOverlay.modelSizePx}px`, height: `${markerOverlay.modelSizePx}px` }}
            />
          ) : null}
        </div>
      ) : null}

      <div className="ar-overlay">
        <Link to="/" className="back-btn">
          <IoArrowBack /> Back to Home
        </Link>

        <div className="scan-topbar">
          <button
            className="scan-topbar__scanbtn"
            onClick={handleScanAgain}
            disabled={showBusy}
            aria-disabled={showBusy}
          >
            <i className={`bi ${showBusy ? "bi-hourglass-split" : "bi-qr-code-scan"} me-2`}></i>
            {showBusy ? "Preparing..." : isScanning ? "Scanning..." : "Scan Mushroom"}
          </button>
        </div>

        <div className="scan-instructions">
          <div className={`ar-marker ar-marker--${frameState}`} aria-hidden="true" />
          <div className={`scan-frame scan-frame--${frameState}`} />
          <h3 className="ar-title">Scan Mushroom</h3>
          <p className="ar-subtitle">
            Point your camera at a mushroom marker (QR card).
          </p>

          {scanMessage && (
            <div className="scan-status" role="status" aria-live="polite">
              {scanMessage}
            </div>
          )}

          {arCatalogStatus === "error" && (
            <div className="scan-status" role="status" aria-live="polite">
              AR database not reachable. Showing on-device demo details.
            </div>
          )}

          {markerStatus === "unsupported" && (
            <div className="scan-status" role="status" aria-live="polite">
              Marker scanning not supported in this browser. Falling back to AI detection.
            </div>
          )}
        </div>

        {showMarkers && !detected && !isScanning && (
          <div className="ar-marker-cards" role="region" aria-label="Mushroom marker cards">
            <div className="ar-marker-cards__title">
              Use these marker cards for instant detection (open on another phone or print).
            </div>
            <div className="ar-marker-cards__grid">
              {markerItems.map((item) => {
                const qr = markerDataUrls[item.markerKey];
                const payload = `${MARKER_PREFIX}${String(item.markerKey).toUpperCase()}`;
                return (
                  <div key={item.markerKey} className="ar-marker-card">
                    <div className="ar-marker-card__img" style={{ backgroundImage: `url(${item.markerImg})` }} />
                    <div className="ar-marker-card__body">
                      <div className="ar-marker-card__name">{item.name}</div>
                      <div className="ar-marker-card__meta">{item.type}</div>
                      <div className="ar-marker-card__qr">
                        {qr ? (
                          <img src={qr} alt={`${item.name} QR marker`} />
                        ) : (
                          <div className="ar-marker-card__qr-fallback">QR: {payload}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {detected && resultStage !== "none" && (
          <div className="ar-detected-pill" role="status" aria-live="polite">
            <i className="bi bi-flower1 me-2"></i>
            <span className="ar-detected-pill__label">Detected:</span>
            <strong className="ar-detected-pill__name">{detected.name}</strong>
          </div>
        )}

        {detected && resultStage === "card" && (
          <div className="ar-info-card" role="dialog" aria-label="Mushroom detection result">
            <div className="ar-info-card__header">
              <div className="ar-info-card__title">
                <span className="ar-icon"><i className="bi bi-flower1"></i></span>
                <span>{detected.name}</span>
              </div>
              <div className="ar-info-card__confidence">
                Detection Confidence: <strong>{detected.confidencePct}%</strong>
              </div>
            </div>

            {detected.notice && (
              <div className="ar-info-card__notice" role="status" aria-live="polite">
                <i className="bi bi-info-circle me-2"></i>
                {detected.notice}
              </div>
            )}

            <div className="ar-info-card__meta">
              <div className="ar-pill">
                <i className="bi bi-pin-angle me-2"></i>
                {detected.type}
              </div>
              <div className={`ar-pill ${detected.safety === "safe" ? "ar-pill--safe" : "ar-pill--danger"}`}>
                <i className={`bi ${detected.safety === "safe" ? "bi-shield-check" : "bi-shield-x"} me-2`}></i>
                {detected.safety === "safe" ? "Safe to Eat" : "Not Safe to Eat"}
              </div>
            </div>

            <div className="ar-info-card__section-title">Nutritional Info (Demo)</div>
            <div className="ar-nutrients">
              <div className="ar-nutrient">
                <i className="bi bi-lightning-charge"></i>
                <span>Protein</span>
                <strong>{detected.nutrition.proteinG}g</strong>
              </div>
              <div className="ar-nutrient">
                <i className="bi bi-tree"></i>
                <span>Fiber</span>
                <strong>{detected.nutrition.fiberG}g</strong>
              </div>
              <div className="ar-nutrient">
                <i className="bi bi-brightness-high"></i>
                <span>Vitamin D</span>
                <strong>{detected.nutrition.vitaminDDV}% DV</strong>
              </div>
              <div className="ar-nutrient">
                <i className="bi bi-battery-half"></i>
                <span>Potassium</span>
                <strong>{detected.nutrition.potassiumMg}mg</strong>
              </div>
            </div>

            <div className="ar-info-card__section-title">Health Benefits</div>
            <div className="ar-benefits">
              {(detected.benefits || ["Boosts immunity", "Supports heart health", "Rich in antioxidants"]).slice(0, 3).map((b) => (
                <div key={b} className="ar-benefit">
                  <i className="bi bi-check2-circle me-2"></i>
                  <span>{b}</span>
                </div>
              ))}
            </div>

            {resolved3d.kind !== "none" && resolved3d.src && (
              <>
                <div className="ar-info-card__section-title">3D Model</div>
                <div className="ar-model">
                  {resolved3d.kind === "sketchfab" ? (
                    <iframe
                      title={`${detected.name} Sketchfab model`}
                      className="ar-model__iframe"
                      src={resolved3d.src}
                      allow="autoplay; fullscreen; xr-spatial-tracking"
                      allowFullScreen
                    />
                  ) : (
                    <model-viewer
                      src={resolved3d.src}
                      alt={`${detected.name} 3D model`}
                      camera-controls
                      auto-rotate
                      rotation-per-second="20deg"
                      shadow-intensity="0.6"
                      className="ar-model__viewer"
                    />
                  )}
                  <div className="ar-model__hint">
                    Rotate with one finger. Pinch to zoom.
                    {resolved3d.kind === "sketchfab" ? " Sketchfab opens inside this card." : " 3D preview opens inside this card."}
                  </div>
                </div>
              </>
            )}

            <div className="ar-info-card__actions">
              <button className="ar-scan-again-btn" onClick={handleScanAgain}>
                <i className="bi bi-arrow-repeat me-2"></i>
                Scan Again
              </button>
              <button className="ar-scan-again-btn ar-scan-again-btn--secondary" onClick={() => setShowMarkers((s) => !s)}>
                <i className="bi bi-collection me-2"></i>
                {showMarkers ? "Hide Markers" : "Show Markers"}
              </button>
            </div>
          </div>
        )}

        <div className="ar-controls">
          <button
            className="info-btn"
            onClick={() => alert("Tip: center the mushroom in the frame and keep the camera steady.")}
          >
            <IoInformationCircleOutline /> Instructions
          </button>
          <button
            className="info-btn"
            onClick={() => setShowMarkers((s) => !s)}
          >
            <i className="bi bi-collection me-2"></i>
            {showMarkers ? "Hide Markers" : "Show Markers"}
          </button>
          <a className="info-btn ar-link-btn" href="/mushroom-markers" target="_blank" rel="noreferrer">
            <i className="bi bi-display me-2"></i>
            Open Marker Board
          </a>
        </div>
      </div>
    </div>
  );
};

export default MushroomAR;
