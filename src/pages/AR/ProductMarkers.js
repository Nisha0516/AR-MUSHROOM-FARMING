import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { mushroomAPI, getAssetUrl } from '../../services/api';
import "./MushroomMarkers.css";

export default function ProductMarkers() {
  const [items, setItems] = useState([]);
  const [dataUrls, setDataUrls] = useState({});
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState("");

  const scanPath = "/scan-product";
  const scanUrl = typeof window !== "undefined" ? `${window.location.origin}${scanPath}` : scanPath;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await mushroomAPI.getAll();
        const list = Array.isArray(res?.data) ? res.data : [];
        if (!mounted) return;
        setItems(list);
        setLoadError(list.length ? "" : "No products found in DB.");
      } catch (e) {
        if (!mounted) return;
        setLoadError("Failed to load products from DB.");
        setItems([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const markerItems = useMemo(() => items, [items]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const out = {};
      for (const p of markerItems) {
        const payload =
          typeof window !== "undefined"
            ? `${window.location.origin}/product/${p._id}`
            : `PRODUCT:${p._id}`;

        out[p._id] = await QRCode.toDataURL(payload, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 320,
          color: { dark: "#0b0b0e", light: "#ffffff" },
        });
      }
      if (mounted) setDataUrls(out);
    })();
    return () => {
      mounted = false;
    };
  }, [markerItems]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(scanUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      setCopied(false);
    }
  };

  return (
    <div className="marker-board">
      <div className="marker-board__top">
        <div className="marker-board__header">
          <div className="marker-board__left">
            <Link to="/" className="marker-board__back">
              <i className="bi bi-arrow-left me-2"></i>
              Back
            </Link>
          </div>

          <div className="marker-board__center">
            <div className="marker-board__title">Product Marker Board</div>
            <div className="marker-board__hint">
              Keep this page open on your laptop (or print). On your phone, open{" "}
              <a className="marker-board__link" href={scanPath} target="_blank" rel="noreferrer">
                {scanPath}
              </a>{" "}
              and scan any product QR below.
            </div>
          </div>

          <div className="marker-board__right">
            <a className="marker-board__btn" href={scanPath} target="_blank" rel="noreferrer">
              <i className="bi bi-qr-code-scan me-2"></i>
              Open Scanner
            </a>
            <button className="marker-board__btn" type="button" onClick={handleCopyLink} title={scanUrl}>
              <i className={`bi ${copied ? "bi-check2" : "bi-clipboard"} me-2`}></i>
              {copied ? "Copied" : "Copy Link"}
            </button>
            <button className="marker-board__btn marker-board__btn--accent" type="button" onClick={() => window.print()}>
              <i className="bi bi-printer me-2"></i>
              Print
            </button>
          </div>
        </div>

        <div className="marker-board__subhint">
          Scan link: <span className="marker-board__mono">{scanUrl}</span>
        </div>
        {loadError && (
          <div className="marker-board__subhint" style={{ marginTop: 8 }}>
            {loadError}
          </div>
        )}
      </div>

      <div className="marker-board__grid">
        {markerItems.map((p) => {
          const qr = dataUrls[p._id];
          const payload =
            typeof window !== "undefined"
              ? `${window.location.origin}/product/${p._id}`
              : `PRODUCT:${p._id}`;

          return (
            <div className="marker-card" key={p._id}>
              <div
                className="marker-card__img marker-card__img--full"
                style={{ backgroundImage: `url(${getAssetUrl(p.image || "/uploads/mush-11.jpg")})` }}
              />
              <div className="marker-card__body">
                <div className="marker-card__topline">
                  <div className="marker-card__name">{p.name}</div>
                  <div className="marker-card__chip">
                    <i className="bi bi-bag-check me-2"></i>
                    Product
                  </div>
                </div>
                <div className="marker-card__meta">{p.category || "Catalog"}</div>
                <div className="marker-card__qr">
                  {qr ? <img src={qr} alt={`${p.name} QR`} /> : <div className="marker-card__qr-fallback">{payload}</div>}
                </div>
                <div className="marker-card__caption">Tip: fill the camera frame with this QR for fastest detection.</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="marker-board__footer">
        Use case: print these as stickers and attach to product boxes, or show this screen in-store.
      </div>
    </div>
  );
}
