import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import mushImg11 from "../../assets/menu/mush-11.jpg";
import mushImg12 from "../../assets/menu/mush-12.jpg";
import mushImg13 from "../../assets/menu/mush-13.jpg";
import mushImg14 from "../../assets/menu/mush-14.jpg";
import { arAPI } from "../../services/api";
import "./MushroomMarkers.css";

const MARKER_PREFIX = "MUSHROOM:";

const FALLBACK_MARKERS = [
  { markerKey: "button", name: "Button Mushroom", typeLabel: "Edible, Cultivated", image: mushImg11 },
  { markerKey: "oyster", name: "Oyster Mushroom", typeLabel: "Edible, Cultivated", image: mushImg12 },
  { markerKey: "shiitake", name: "Shiitake Mushroom", typeLabel: "Edible, Medicinal, Cultivated", image: mushImg13 },
  { markerKey: "enoki", name: "Enoki Mushroom", typeLabel: "Edible, Cultivated", image: mushImg14 },
];

export default function MushroomMarkers() {
  const [markerItems, setMarkerItems] = useState([]);
  const markerItemsMemo = useMemo(() => (markerItems?.length ? markerItems : FALLBACK_MARKERS), [markerItems]);
  const [dataUrls, setDataUrls] = useState({});
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await arAPI.getAllMushrooms();
        const items = Array.isArray(res?.data) ? res.data : [];
        if (!mounted) return;
        if (items.length) {
          setMarkerItems(items);
          setLoadError("");
        } else {
          setLoadError("No AR marker data found in DB. Showing fallback markers.");
        }
      } catch (e) {
        if (!mounted) return;
        setLoadError("Failed to load markers from DB. Showing fallback markers.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const out = {};
      for (const m of markerItemsMemo) {
        const key = m.markerKey || m.key;
        const payload = `${MARKER_PREFIX}${String(key).toUpperCase()}`;
        out[key] = await QRCode.toDataURL(payload, {
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
  }, [markerItemsMemo]);

  const scanPath = "/scan-mushroom";
  const scanUrl = typeof window !== "undefined" ? `${window.location.origin}${scanPath}` : scanPath;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(scanUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      // Clipboard API may be blocked; fall back to showing the URL in the UI.
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
            <div className="marker-board__title">Mushroom Marker Board</div>
            <div className="marker-board__hint">
              Keep this page open on your laptop. On your phone, open{" "}
              <a className="marker-board__link" href={scanPath} target="_blank" rel="noreferrer">
                {scanPath}
              </a>{" "}
              and scan any QR below.
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
        {markerItemsMemo.map((m) => {
          const key = m.markerKey || m.key;
          const qr = dataUrls[key];
          const payload = `${MARKER_PREFIX}${String(key).toUpperCase()}`;
          const imgUrl = m.image || m.img;
          const typeLabel = m.typeLabel || m.type;
          return (
            <div className="marker-card" key={key}>
              <div className="marker-card__img" style={{ backgroundImage: `url(${imgUrl})` }} />
              <div className="marker-card__body">
                <div className="marker-card__topline">
                  <div className="marker-card__name">{m.name}</div>
                  <div className="marker-card__chip">
                    <i className="bi bi-tag me-2"></i>
                    Marker
                  </div>
                </div>
                <div className="marker-card__meta">{typeLabel}</div>
                <div className="marker-card__qr">
                  {qr ? (
                    <img src={qr} alt={`${m.name} marker`} />
                  ) : (
                    <div className="marker-card__qr-fallback">{payload}</div>
                  )}
                </div>
                <div className="marker-card__caption">Tip: fill the camera frame with this QR for fastest detection.</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="marker-board__footer">
        Tip: max brightness on laptop screen, avoid glare, and keep the QR steady.
      </div>
    </div>
  );
}
