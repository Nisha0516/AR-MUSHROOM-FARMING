import React, { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Form, InputGroup, Spinner, Table } from "react-bootstrap";
import AdminLayout from "./AdminLayout";
import { arAPI } from "../../services/api";
import "../../styles/AdminStyle.css";

function formatDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

function safeNum(n, fallback = "-") {
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

function getSourceBadge(source) {
  const s = String(source || "").toLowerCase();
  if (s === "marker") return <Badge bg="success-light" className="text-success px-3 py-2">MARKER</Badge>;
  if (s === "ai") return <Badge bg="primary-light" className="text-primary px-3 py-2">AI</Badge>;
  if (s === "fallback") return <Badge bg="warning-light" className="text-warning px-3 py-2">FALLBACK</Badge>;
  return <Badge bg="secondary-light" className="text-secondary px-3 py-2">{s ? s.toUpperCase() : "UNKNOWN"}</Badge>;
}

function getSafetyBadge(safety) {
  const s = String(safety || "").toLowerCase();
  if (s === "safe") return <Badge bg="success-light" className="text-success px-3 py-2">SAFE</Badge>;
  if (s === "not_safe") return <Badge className="text-danger px-3 py-2" style={{ backgroundColor: "rgba(227, 0, 14, 0.1)" }}>NOT SAFE</Badge>;
  return <Badge bg="secondary-light" className="text-secondary px-3 py-2">UNKNOWN</Badge>;
}

export default function ARScanRegistry() {
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scans, setScans] = useState([]);
  const [search, setSearch] = useState("");

  const fetchScans = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await arAPI.getRecentScans({ limit });
      if (res?.success) {
        setScans(Array.isArray(res.data) ? res.data : []);
      } else {
        setError(res?.message || "Failed to fetch AR scans from server.");
      }
    } catch (e) {
      setError("Network error connecting to the database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  const filtered = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();
    if (!q) return scans;
    return scans.filter((s) => {
      const mk = String(s?.markerKey || "").toLowerCase();
      const name = String(s?.mushroom?.name || "").toLowerCase();
      const type = String(s?.mushroom?.typeLabel || "").toLowerCase();
      const source = String(s?.source || "").toLowerCase();
      return mk.includes(q) || name.includes(q) || type.includes(q) || source.includes(q);
    });
  }, [scans, search]);

  return (
    <AdminLayout>
      <Card className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>
        <Card.Header
          className="bg-white border-0 p-4 d-flex justify-content-between align-items-center"
          style={{ borderBottom: "1px solid var(--admin-border) !important" }}
        >
          <div>
            <h5 className="mb-1 font-weight-bold" style={{ fontFamily: "var(--admin-font-head)", color: "var(--admin-accent)" }}>
              AR Scan Registry
            </h5>
            <div className="small text-stone">Latest scans stored from `/scan-mushroom`</div>
          </div>

          <div className="d-flex align-items-center gap-2" style={{ minWidth: 520 }}>
            <InputGroup className="bg-light rounded-pill overflow-hidden border-0 shadow-sm">
              <InputGroup.Text className="bg-transparent border-0 ps-3">
                <i className="bi bi-search text-muted"></i>
              </InputGroup.Text>
              <Form.Control
                placeholder="Search marker key, mushroom name, type, source..."
                className="bg-transparent border-0 py-2 shadow-none small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>

            <Form.Select
              size="sm"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value) || 50)}
              style={{ width: 140 }}
              aria-label="Limit scans"
            >
              <option value={20}>Last 20</option>
              <option value={50}>Last 50</option>
              <option value={100}>Last 100</option>
            </Form.Select>

            <Button variant="outline-secondary" size="sm" onClick={fetchScans} disabled={loading}>
              <i className="bi bi-arrow-repeat me-2"></i>
              Refresh
            </Button>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" style={{ color: "var(--admin-accent)" }} />
              <p className="mt-3 text-muted">Loading scan history...</p>
            </div>
          ) : error ? (
            <div className="p-4">
              <Alert variant="danger" className="mb-0">{error}</Alert>
            </div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="bg-stone">
                <tr className="small text-stone text-uppercase">
                  <th className="py-3 ps-4">Time</th>
                  <th className="py-3">Mushroom</th>
                  <th className="py-3">Marker</th>
                  <th className="py-3">Safety</th>
                  <th className="py-3">Source</th>
                  <th className="py-3 text-end">Confidence</th>
                  <th className="py-3 text-end pe-4">Nutrients</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((scan) => {
                  const createdAt = formatDateTime(scan?.createdAt);
                  const name = scan?.mushroom?.name || "Unknown";
                  const typeLabel = scan?.mushroom?.typeLabel || "";
                  const markerKey = scan?.markerKey || "-";
                  const safety = scan?.mushroom?.safety || "unknown";
                  const confidence = safeNum(scan?.confidencePct, null);
                  const nutrients = scan?.nutrients || {};

                  return (
                    <tr key={scan?._id || `${markerKey}-${scan?.createdAt}`} className="border-bottom">
                      <td className="py-3 ps-4 small">{createdAt}</td>
                      <td className="py-3">
                        <div className="font-weight-bold">{name}</div>
                        <div className="smaller text-stone">{typeLabel}</div>
                      </td>
                      <td className="py-3">
                        <span className="small font-weight-bold text-dark">{String(markerKey).toUpperCase()}</span>
                      </td>
                      <td className="py-3">{getSafetyBadge(safety)}</td>
                      <td className="py-3">{getSourceBadge(scan?.source)}</td>
                      <td className="py-3 text-end font-weight-bold">
                        {typeof confidence === "number" ? `${confidence}%` : "-"}
                      </td>
                      <td className="py-3 text-end pe-4 small">
                        <div><i className="bi bi-lightning-charge me-1"></i> {safeNum(nutrients.proteinG)}g</div>
                        <div><i className="bi bi-tree me-1"></i> {safeNum(nutrients.fiberG)}g</div>
                        <div><i className="bi bi-brightness-high me-1"></i> {safeNum(nutrients.vitaminDDV)}% DV</div>
                        <div><i className="bi bi-battery-half me-1"></i> {safeNum(nutrients.potassiumMg)}mg</div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      No scans found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>

        <Card.Footer className="bg-white border-0 p-4 d-flex justify-content-between align-items-center">
          <p className="small text-stone mb-0">
            Showing {filtered.length} of {scans.length} scans
          </p>
          <div className="small text-stone">
            Tip: scan from your phone, then refresh here.
          </div>
        </Card.Footer>
      </Card>
    </AdminLayout>
  );
}
