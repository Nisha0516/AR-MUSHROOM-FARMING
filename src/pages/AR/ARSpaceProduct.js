import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, Badge, Button, Container, Spinner } from "react-bootstrap";
import { mushroomAPI, getAssetUrl } from '../../services/api';
import "@google/model-viewer";

function resolvePrice(product, measure) {
  if (!product) return 0;
  if (measure && product.prices && product.prices[measure] != null) return Number(product.prices[measure]) || 0;
  return Number(product.price) || 0;
}

function getUses(product) {
  const uses = Array.isArray(product?.uses) ? product.uses.filter(Boolean) : [];
  if (uses.length) return uses.slice(0, 6);
  const cat = String(product?.category || "").toLowerCase();
  if (cat.includes("kit")) return ["Home cultivation", "Beginner-friendly", "Fast setup"];
  if (cat.includes("equipment")) return ["Farm setup", "Climate monitoring", "Repeat use"];
  if (cat.includes("supplies")) return ["Sterile workflow", "Inoculation support", "Cultivation process"];
  return ["Mushroom cultivation", "Farm workflow", "Educational demo"];
}

function normalizeModelUrl(raw, origin) {
  const v = String(raw || "").trim();
  if (!v) return "";

  // Fix common DB values that break on phone HTTPS (mixed-content).
  // Example stored: http://localhost:5000/uploads/file.glb -> use same-origin /uploads/...
  try {
    const u = new URL(v);
    if (u.pathname.startsWith("/uploads/")) {
      // Any absolute URL to /uploads should be mapped to same-origin /uploads.
      return new URL(u.pathname, origin).toString();
    }
  } catch (e) {
    // not an absolute URL; continue
  }

  // Relative path like /uploads/x.glb
  try {
    return new URL(v, origin).toString();
  } catch (e) {
    return v;
  }
}

export default function ARSpaceProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const viewerRef = useRef(null);
  const secureContext = useMemo(() => Boolean(window.isSecureContext), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [selectedMeasure, setSelectedMeasure] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelProgress, setModelProgress] = useState(0); // 0..1
  const [arStatus, setArStatus] = useState("idle");
  const [modelError, setModelError] = useState("");
  const [assetInfo, setAssetInfo] = useState(null); // { url, status, contentType, contentLength }
  const [webxrSupported, setWebxrSupported] = useState(null); // null | boolean

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!("xr" in navigator) || typeof navigator.xr?.isSessionSupported !== "function") {
          if (mounted) setWebxrSupported(false);
          return;
        }
        const ok = await navigator.xr.isSessionSupported("immersive-ar");
        if (mounted) setWebxrSupported(Boolean(ok));
      } catch (e) {
        if (mounted) setWebxrSupported(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      setProduct(null);
      setModelLoaded(false);
      setModelProgress(0);
      setModelError("");
      try {
        const res = await mushroomAPI.getById(id);
        if (!mounted) return;
        if (res?.success && res.data) {
          setProduct(res.data);
          const measures = Array.isArray(res.data?.measures) ? res.data.measures : [];
          setSelectedMeasure(measures.length ? measures[0] : null);
        } else {
          setError(res?.message || "Failed to load product.");
        }
      } catch (e) {
        if (!mounted) return;
        setError("Network error connecting to the database.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const absModelUrl = useMemo(() => getAssetUrl(product?.modelUrl), [product?.modelUrl]);

  const currentPrice = useMemo(() => resolvePrice(product, selectedMeasure), [product, selectedMeasure]);
  const uses = useMemo(() => getUses(product), [product]);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    const onLoad = () => setModelLoaded(true);
    const onError = () => {
      setModelError("3D model failed to load. Upload a smaller GLB or verify the modelUrl path.");
      setModelLoaded(false);
    };
    const onProgress = (ev) => {
      const p = Number(ev?.detail?.totalProgress);
      if (!Number.isFinite(p)) return;
      setModelProgress(Math.max(0, Math.min(1, p)));
    };
    const onArStatus = (ev) => {
      const status = ev?.detail?.status;
      if (status) setArStatus(String(status));
    };

    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);
    el.addEventListener("progress", onProgress);
    el.addEventListener("ar-status", onArStatus);
    return () => {
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onError);
      el.removeEventListener("progress", onProgress);
      el.removeEventListener("ar-status", onArStatus);
    };
  }, [absModelUrl]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!absModelUrl) {
        if (mounted) setAssetInfo(null);
        return;
      }
      try {
        const res = await fetch(absModelUrl, { method: "HEAD", cache: "no-store" });
        const info = {
          url: absModelUrl,
          status: res.status,
          contentType: res.headers.get("content-type") || "",
          contentLength: res.headers.get("content-length") || "",
        };
        if (mounted) setAssetInfo(info);
      } catch (e) {
        if (mounted) setAssetInfo({ url: absModelUrl, status: "ERR", contentType: "", contentLength: "" });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [absModelUrl]);

  const handleStartAR = async () => {
    try {
      setModelError("");
      const el = viewerRef.current;
      if (!el) return;
      if (!secureContext) {
        setModelError("This page is not a trusted secure context. WebAR needs trusted HTTPS. Use a real HTTPS URL (ngrok/Cloudflare tunnel) or install a trusted certificate on your phone.");
        return;
      }
      if (webxrSupported === false) {
        setModelError("WebAR is not supported in this browser. Use Chrome on Android with ARCore installed.");
        return;
      }
      if (!modelLoaded) {
        setModelError("Wait for the 3D model to finish loading, then try again.");
        return;
      }
      if (typeof el.activateAR === "function") {
        await el.activateAR();
      }
    } catch (e) {
      setModelError("AR could not start. On Android, install ARCore and use Chrome + HTTPS.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0e", color: "#fff" }}>
      <Container fluid className="py-3">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <Button variant="outline-light" className="rounded-pill" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left me-2"></i>
              Back
            </Button>
            <Link to="/" className="btn btn-outline-light rounded-pill">
              Home
            </Link>
          </div>
          <div className="text-white-50 small">
            Android: Use Chrome + HTTPS. Install Google Play Services for AR (ARCore).
          </div>
        </div>
      </Container>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="light" />
          <div className="text-white-50 mt-3">Loading AR experience...</div>
        </div>
      ) : error ? (
        <Container className="py-4">
          <Alert variant="danger">{error}</Alert>
        </Container>
      ) : (
        <>
          <div style={{ position: "relative", width: "100%", height: "62vh", background: "#0b0b0e" }}>
            <model-viewer
              ref={viewerRef}
              src={absModelUrl || ""}
              alt={`${product?.name || "Product"} 3D model`}
              camera-controls
              auto-rotate
              rotation-per-second="20deg"
              shadow-intensity="0.6"
              loading="eager"
              ar
              ar-placement="floor"
              ar-modes="webxr"
              crossorigin="anonymous"
              style={{ width: "100%", height: "100%", background: "#0b0b0e" }}
            />

            {!!absModelUrl && !modelLoaded && !modelError ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 16,
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    width: "min(520px, 100%)",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 18,
                    padding: 14,
                    backdropFilter: "blur(14px)",
                    boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Spinner animation="border" variant="light" size="sm" />
                    <div style={{ fontWeight: 800 }}>Loading 3D model...</div>
                    <div className="ms-auto text-white-50 small">{Math.round(modelProgress * 100)}%</div>
                  </div>
                  <div
                    className="mt-2"
                    style={{
                      height: 8,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.10)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.round(modelProgress * 100)}%`,
                        height: "100%",
                        background: "rgba(247,190,39,0.85)",
                      }}
                    />
                  </div>
                  <div className="text-white-50 small mt-2" style={{ lineHeight: 1.35 }}>
                    If this stays here for long, the model is too large for mobile. Try a smaller GLB.
                  </div>
                </div>
              </div>
            ) : null}

            <div style={{ position: "absolute", left: 16, right: 16, bottom: 16 }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 18,
                  padding: 14,
                  backdropFilter: "blur(14px)",
                  boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
                }}
              >
                <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                  <div>
                    <div style={{ fontWeight: 900, fontSize: "1.15rem" }}>{product?.name}</div>
                    <div className="text-white-50 small">{product?.category || "Product"}</div>
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <Badge bg={product?.stock > 0 ? "success" : "secondary"} className="px-3 py-2">
                      {product?.stock > 0 ? `IN STOCK (${product.stock})` : "OUT OF STOCK"}
                    </Badge>
                    <Badge bg="warning" text="dark" className="px-3 py-2">
                      Rs. {currentPrice}/-
                    </Badge>
                  </div>
                </div>

                <div className="mt-2 text-white-50 small" style={{ lineHeight: 1.45 }}>
                  {product?.description || "No description available."}
                </div>

                <div className="mt-3 d-flex flex-wrap gap-2">
                  {uses.map((u) => (
                    <span key={u} className="badge" style={{ background: "rgba(247,190,39,0.14)", border: "1px solid rgba(247,190,39,0.22)", color: "rgba(255,255,255,0.92)", padding: "10px 12px", borderRadius: 999 }}>
                      <i className="bi bi-check2-circle me-2"></i>
                      {u}
                    </span>
                  ))}
                </div>

                {modelError && <div className="text-danger small mt-3">{modelError}</div>}
                {arStatus === "failed" && (
                  <div className="text-warning small mt-2">
                    AR failed to start. Ensure ARCore is installed and open this page with HTTPS.
                  </div>
                )}
                {webxrSupported === false && (
                  <div className="text-warning small mt-2">
                    WebAR not supported here. If you were using Scene Viewer earlier, note: Scene Viewer often fails with local/self-signed HTTPS during development.
                  </div>
                )}
                {!secureContext && (
                  <div className="text-warning small mt-2">
                    Secure context: NO. Self-signed/local HTTPS is often treated as untrusted on Android, so WebAR will fail.
                  </div>
                )}
                {assetInfo && (
                  <div className="text-white-50 small mt-2" style={{ wordBreak: "break-word" }}>
                    Model URL: {assetInfo.url}
                    <br />
                    HEAD: {String(assetInfo.status)} {assetInfo.contentType ? `| ${assetInfo.contentType}` : ""}{" "}
                    {assetInfo.contentLength ? `| ${assetInfo.contentLength} bytes` : ""}
                    {assetInfo.contentLength && Number(assetInfo.contentLength) > 35000000 ? (
                      <>
                        <br />
                        Warning: This model is very large. On Android it may fail to load. Try a smaller GLB.
                      </>
                    ) : null}
                  </div>
                )}

                <div className="mt-3 d-flex gap-2 flex-wrap">
                  <Button
                    variant="light"
                    className="rounded-pill fw-bold"
                    onClick={handleStartAR}
                    disabled={!absModelUrl || !modelLoaded}
                  >
                    <i className="bi bi-camera me-2"></i>
                    Start AR (View in your space)
                  </Button>
                  <Button variant="outline-light" className="rounded-pill" onClick={() => navigate(`/product/${product?._id}`)}>
                    <i className="bi bi-box-arrow-up-right me-2"></i>
                    Product Page
                  </Button>
                </div>
                {!!absModelUrl && !modelLoaded && !modelError ? (
                  <div className="text-white-50 small mt-2">Loading model... {Math.round(modelProgress * 100)}%</div>
                ) : null}
                {!absModelUrl && (
                  <div className="text-white-50 small mt-2">
                    This product has no `modelUrl` (GLB). Upload one in Admin Catalog to enable AR.
                  </div>
                )}
              </div>
            </div>
          </div>

          <Container className="py-3 text-white-50 small">
            Tip: If the model is too large, it will take a long time to load and AR may not start. Use a smaller GLB for best results.
          </Container>
        </>
      )}
    </div>
  );
}
