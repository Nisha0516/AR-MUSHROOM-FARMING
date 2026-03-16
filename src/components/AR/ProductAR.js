import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoArrowBack, IoInformationCircleOutline } from "react-icons/io5";
import { CartContext } from "../../context/CartContext";
import { mushroomAPI, getAssetUrl } from "../../services/api";
import "@google/model-viewer";
import "./MushroomAR.css";

const SCAN_DURATION_MS = 2000;
const SCAN_INTERVAL_MS = 250;
const PRODUCT_PREFIX = "PRODUCT:";

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

function normalizeProductIdFromQR(rawValue) {
  const v = String(rawValue || "").trim();
  if (!v) return "";
  const upper = v.toUpperCase();
  if (upper.startsWith(PRODUCT_PREFIX)) return v.slice(PRODUCT_PREFIX.length).trim();

  // Accept direct product URLs like https://host/product/<id>
  try {
    const u = new URL(v);
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("product");
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  } catch (e) {
    // not a URL
  }

  // Accept raw mongo objectId-like strings
  if (/^[a-fA-F0-9]{24}$/.test(v)) return v;

  return "";
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

function resolvePrice(product, measure) {
  if (!product) return 0;
  if (measure && product.prices && product.prices[measure] != null) return Number(product.prices[measure]) || 0;
  return Number(product.price) || 0;
}

function getProductUses(product) {
  const uses = Array.isArray(product?.uses) ? product.uses.filter(Boolean) : [];
  if (uses.length) return uses.slice(0, 5);

  const cat = String(product?.category || "").toLowerCase();
  if (cat.includes("kit")) return ["Home cultivation", "Beginner-friendly", "Step-by-step growing"];
  if (cat.includes("equipment")) return ["Farm setup", "Clean workspace", "Long-term use"];
  if (cat.includes("supplies")) return ["Sterile handling", "Inoculation support", "Cultivation workflow"];
  if (cat.includes("service")) return ["Consultation", "Farm support", "Guided planning"];
  return ["Mushroom cultivation", "Farm workflow", "Educational demo"];
}

export default function ProductAR() {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const markerDetectorRef = useRef(null);
  const qrDecodeRef = useRef(null);
  const qrCanvasRef = useRef(null);
  const qrCtxRef = useRef(null);
  const scanTimerRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const stageTimeoutRef = useRef(null);

  const markerStatsRef = useRef({}); // { [productId]: { count, bestArea } }
  const bestProductIdRef = useRef(null);

  const [cameraStatus, setCameraStatus] = useState("idle"); // idle | loading | ready | error
  const [markerStatus, setMarkerStatus] = useState("idle"); // idle | ready | unsupported
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");

  const [detected, setDetected] = useState(null); // { product, confidencePct, notice, fallback }
  const [resultStage, setResultStage] = useState("none"); // none | name | card
  const [selectedMeasure, setSelectedMeasure] = useState(null);
  const [markerOverlay, setMarkerOverlay] = useState(null); // { leftPct, topPct, widthPct, heightPct, rotDeg, modelSizePx }

  const lastOverlayRef = useRef(null);
  const lastMarkerSeenMsRef = useRef(0);

  const [fallbackProducts, setFallbackProducts] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await mushroomAPI.getAll();
        const items = Array.isArray(res?.data) ? res.data : [];
        if (mounted) setFallbackProducts(items);
      } catch (e) {
        if (mounted) setFallbackProducts([]);
      }
    })();
    return () => {
      mounted = false;
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
    let cancelled = false;

    async function startCamera() {
      setCameraStatus("loading");
      setScanMessage("");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
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
          setScanMessage("Camera needs HTTPS on mobile. Open https://<PC_IP>:3000/scan-product.");
        } else {
          setScanMessage("Camera permission denied or unavailable. Please allow camera access.");
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
      if (stageTimeoutRef.current) window.clearTimeout(stageTimeoutRef.current);
      stageTimeoutRef.current = null;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const canScan = isScanning && cameraStatus === "ready" && markerStatus === "ready" && !!videoRef.current;
    if (!canScan) return;

    markerStatsRef.current = {};
    bestProductIdRef.current = null;
    lastMarkerSeenMsRef.current = 0;
    lastOverlayRef.current = null;
    setMarkerOverlay(null);
    setScanMessage("Scanning... (2 seconds) Point at a product QR.");

    scanTimerRef.current = window.setInterval(async () => {
      try {
        const videoEl = videoRef.current;
        if (!videoEl) return;

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

        // Update QR anchor overlay (marker box + 3D preview anchored above it).
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

        const productId = normalizeProductIdFromQR(markerValue);
        if (!productId) return;

        const stats = markerStatsRef.current[productId] || { count: 0, bestArea: 0 };
        stats.count += 1;
        stats.bestArea = Math.max(stats.bestArea, markerArea || 0);
        markerStatsRef.current[productId] = stats;

        // Determine best productId so far (by count, then by area).
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
        bestProductIdRef.current = bestKey;
      } catch (e) {
        // Keep scan session alive
      }
    }, SCAN_INTERVAL_MS);

    scanTimeoutRef.current = window.setTimeout(() => {
      (async () => {
        const bestId = bestProductIdRef.current;
        setIsScanning(false);
        setScanMessage("");

        const showStages = () => {
          setResultStage("name");
          if (stageTimeoutRef.current) window.clearTimeout(stageTimeoutRef.current);
          stageTimeoutRef.current = window.setTimeout(() => setResultStage("card"), 420);
        };

        // If we detected a product, fetch it and show the card
        if (bestId) {
          const stats = markerStatsRef.current?.[bestId] || { count: 1, bestArea: 0 };
          const confidencePct = clamp(78 + stats.count * 4, 78, 99);

          setDetected({ product: null, confidencePct, notice: "Loading product...", fallback: false, productId: bestId });
          showStages();

          try {
            const res = await mushroomAPI.getById(bestId);
            if (res?.success && res.data) {
              const measures = Array.isArray(res.data?.measures) ? res.data.measures : [];
              setSelectedMeasure(measures.length ? measures[0] : null);
              setDetected({ product: res.data, confidencePct, notice: null, fallback: false, productId: bestId });
            } else {
              setDetected({
                product: null,
                confidencePct,
                notice: "Product not found. Please scan again.",
                fallback: true,
                productId: bestId,
              });
            }
          } catch (e) {
            setDetected({
              product: null,
              confidencePct,
              notice: "Failed to load product from server. Please try again.",
              fallback: true,
              productId: bestId,
            });
          }
          return;
        }

        // No QR detected: show a demo product anyway (as requested style from your AR flow)
        const pick = fallbackProducts && fallbackProducts.length
          ? fallbackProducts[Math.floor(Math.random() * fallbackProducts.length)]
          : null;

        if (pick) {
          const measures = Array.isArray(pick?.measures) ? pick.measures : [];
          setSelectedMeasure(measures.length ? measures[0] : null);
          setDetected({
            product: pick,
            confidencePct: 55,
            notice: "No product detected. Showing sample product for demo.",
            fallback: true,
            productId: pick._id,
          });
        } else {
          setDetected({
            product: null,
            confidencePct: 0,
            notice: "No product detected. Please scan again.",
            fallback: true,
            productId: null,
          });
        }
        showStages();
      })();
    }, SCAN_DURATION_MS);

    return () => {
      if (scanTimerRef.current) window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
      if (scanTimeoutRef.current) window.clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    };
  }, [isScanning, cameraStatus, markerStatus, fallbackProducts]);

  const canStartScan = cameraStatus === "ready" && markerStatus === "ready";

  const handleScan = () => {
    setDetected(null);
    setResultStage("none");
    setSelectedMeasure(null);
    if (stageTimeoutRef.current) window.clearTimeout(stageTimeoutRef.current);
    stageTimeoutRef.current = null;
    if (canStartScan) setIsScanning(true);
    else setScanMessage("Camera not ready yet. Please wait a moment.");
  };

  const frameState = detected && detected.product && !detected.fallback ? "found" : isScanning ? "scanning" : "idle";

  const product = detected?.product || null;
  const currentPrice = resolvePrice(product, selectedMeasure);
  const hasArModel = !!(product?.modelUrl || product?.iosModelUrl);
  const modelSrc = getAssetUrl(product?.modelUrl || product?.iosModelUrl);
  const productUses = getProductUses(product);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: selectedMeasure ? `${product._id}-${selectedMeasure}` : product._id,
      title: selectedMeasure ? `${product.name} (${selectedMeasure})` : product.name,
      price: currentPrice,
      image: product.image,
      modelUrl: product.modelUrl,
      measure: selectedMeasure,
    });
    navigate("/checkout");
  };

  const handleViewProduct = () => {
    if (!product?._id) return;
    navigate(`/product/${product._id}`);
  };

  return (
    <div className="ar-page-container">
      <video ref={videoRef} className="ar-camera" playsInline muted autoPlay />
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
            className={`ar-qr-anchor__box ${product && !detected?.fallback ? "ar-qr-anchor__box--found" : ""}`}
            style={{ transform: `rotate(${markerOverlay.rotDeg}deg)` }}
          />
          {product?.name ? <div className="ar-qr-anchor__label">{product.name}</div> : null}
          {modelSrc ? (
            <model-viewer
              className="ar-qr-anchor__model"
              src={modelSrc}
              alt={`${product?.name || "Product"} 3D preview`}
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
            onClick={handleScan}
            disabled={!canStartScan}
            aria-disabled={!canStartScan}
          >
            <i className={`bi ${!canStartScan ? "bi-hourglass-split" : isScanning ? "bi-qr-code-scan" : "bi-qr-code-scan"} me-2`}></i>
            {!canStartScan ? "Preparing..." : isScanning ? "Scanning..." : "Scan Product"}
          </button>
        </div>

        <div className="scan-instructions">
          <div className={`ar-marker ar-marker--${frameState}`} aria-hidden="true" />
          <div className={`scan-frame scan-frame--${frameState}`} />
          <h3 className="ar-title">Scan Product</h3>
          <p className="ar-subtitle">Point your camera at a product QR code.</p>

          {scanMessage && (
            <div className="scan-status" role="status" aria-live="polite">
              {scanMessage}
            </div>
          )}

          {markerStatus === "unsupported" && (
            <div className="scan-status" role="status" aria-live="polite">
              QR scanning not supported in this browser. Try Chrome on Android.
            </div>
          )}
        </div>

        {detected && resultStage !== "none" && (
          <div className={`ar-result ${resultStage === "name" ? "ar-result--name" : "ar-result--card"}`}>
            <div className="ar-info-card">
              <div className="ar-info-card__top">
                <div className="ar-info-card__title">
                  <span className="ar-info-card__title-icon">
                    <i className="bi bi-bag-check"></i>
                  </span>
                  <span>{product?.name || "Product"}</span>
                </div>
                <div className="ar-info-card__confidence">Detection Confidence: {detected.confidencePct || 0}%</div>
              </div>

              {detected.notice && (
                <div className="ar-info-card__notice">
                  <i className="bi bi-info-circle me-2"></i>
                  {detected.notice}
                </div>
              )}

              {product && (
                <>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <div className="ar-pill">
                      <i className="bi bi-tag me-2"></i>
                      {product.category || "Product"}
                    </div>
                    <div className={`ar-pill ${product.stock > 0 ? "ar-pill--safe" : "ar-pill--danger"}`}>
                      <i className={`bi ${product.stock > 0 ? "bi-check2-circle" : "bi-x-circle"} me-2`}></i>
                      {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                    </div>
                  </div>

                  {Array.isArray(product.measures) && product.measures.length > 0 && (
                    <div className="mb-3">
                      <div className="ar-info-card__section-title">Pack Size</div>
                      <select
                        className="form-select form-select-sm"
                        value={selectedMeasure || ""}
                        onChange={(e) => setSelectedMeasure(e.target.value)}
                      >
                        {product.measures.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="ar-info-card__section-title">Description</div>
                  <div className="text-white-50 small mb-3" style={{ lineHeight: 1.45 }}>
                    {product.description || "No description available."}
                  </div>

                  <div className="ar-info-card__section-title">Uses</div>
                  <div className="ar-benefits" style={{ marginTop: 10 }}>
                    {productUses.map((u) => (
                      <div key={u} className="ar-benefit">
                        <i className="bi bi-check2-circle me-2"></i>
                        <span>{u}</span>
                      </div>
                    ))}
                  </div>

                  <div className="ar-info-card__section-title">Price</div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="text-white fw-bold" style={{ fontSize: "1.35rem" }}>Rs. {currentPrice}/-</div>
                    <button className="ar-scan-again-btn ar-scan-again-btn--secondary" onClick={handleViewProduct}>
                      <i className="bi bi-box-arrow-up-right me-2"></i>
                      View Product
                    </button>
                  </div>

                  {hasArModel && (
                    <>
                      <div className="ar-info-card__section-title">3D / AR</div>
                      <div className="text-white-50 small mb-2" style={{ lineHeight: 1.45 }}>
                        Marker-based 3D preview appears above the QR in the camera view (no ARCore needed).
                      </div>
                      <div className="text-white-50 small" style={{ lineHeight: 1.45 }}>
                        Tip: keep the QR steady and well lit for smoother tracking.
                      </div>
                    </>
                  )}

                  <div className="ar-info-card__actions">
                    <button className="ar-scan-again-btn" onClick={handleScan} disabled={!canStartScan}>
                      <i className="bi bi-arrow-repeat me-2"></i>
                      Scan Again
                    </button>
                    <button className="ar-scan-again-btn ar-scan-again-btn--secondary" onClick={handleAddToCart} disabled={product.stock <= 0}>
                      <i className="bi bi-cart-plus me-2"></i>
                      Add to Cart
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="ar-controls">
          <button
            className="info-btn"
            onClick={() => alert(`Tip: Use a product QR (recommended: ${window.location.origin}/product/<PRODUCT_ID>) or ${PRODUCT_PREFIX}<PRODUCT_ID>. You can show printable QRs on /product-markers.`)}
          >
            <IoInformationCircleOutline /> Instructions
          </button>
          <a className="info-btn ar-link-btn" href="/product-markers" target="_blank" rel="noreferrer">
            <i className="bi bi-display me-2"></i>
            Open Product Board
          </a>
          <a className="info-btn ar-link-btn" href="/admin/catalog" target="_blank" rel="noreferrer">
            <i className="bi bi-speedometer2 me-2"></i>
            Open Admin Catalog
          </a>
        </div>
      </div>
    </div>
  );
}
