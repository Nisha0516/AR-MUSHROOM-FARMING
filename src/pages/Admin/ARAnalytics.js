import React, { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import AdminLayout from "./AdminLayout";
import { arAPI } from "../../services/api";
import "../../styles/AdminStyle.css";

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export default function ARAnalytics() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await arAPI.getAnalytics(days);
      if (res?.success) setAnalytics(res.data);
      else setError(res?.message || "Failed to fetch analytics.");
    } catch (e) {
      setError("Network error connecting to the database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const sourceBadges = useMemo(() => {
    const list = Array.isArray(analytics?.sourceBreakdown) ? analytics.sourceBreakdown : [];
    return list.map((s) => {
      const key = String(s.source || "unknown").toLowerCase();
      const label = key.toUpperCase();
      const count = s.count || 0;
      const variant =
        key === "marker" ? "success" : key === "ai" ? "primary" : key === "fallback" ? "warning" : "secondary";
      return (
        <Badge key={key} bg={`${variant}-light`} className={`text-${variant} px-3 py-2 me-2`}>
          {label}: {count}
        </Badge>
      );
    });
  }, [analytics]);

  const handleExportCsv = async () => {
    setExporting(true);
    setError("");
    try {
      // Export up to 5000 scans from the last N days.
      const res = await arAPI.getRecentScans({ limit: 5000, days });
      if (!res?.success) {
        throw new Error(res?.message || "Failed to export scans.");
      }
      const scans = Array.isArray(res.data) ? res.data : [];

      const header = [
        "createdAt",
        "markerKey",
        "mushroomName",
        "typeLabel",
        "safety",
        "source",
        "confidencePct",
        "proteinG",
        "fiberG",
        "vitaminDDV",
        "potassiumMg",
      ];

      const lines = [header.join(",")];
      for (const s of scans) {
        const m = s?.mushroom || {};
        const n = s?.nutrients || {};
        const row = [
          s?.createdAt,
          s?.markerKey,
          m?.name,
          m?.typeLabel,
          m?.safety,
          s?.source,
          s?.confidencePct,
          n?.proteinG,
          n?.fiberG,
          n?.vitaminDDV,
          n?.potassiumMg,
        ].map(csvEscape);
        lines.push(row.join(","));
      }

      const stamp = new Date().toISOString().slice(0, 10);
      downloadTextFile(`ar-scans-last-${days}-days-${stamp}.csv`, lines.join("\n"));
    } catch (e) {
      setError(e?.message || "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const dailyData = Array.isArray(analytics?.dailyCounts) ? analytics.dailyCounts : [];
  const top = Array.isArray(analytics?.topMushrooms) ? analytics.topMushrooms : [];

  return (
    <AdminLayout>
      <Row className="mb-4">
        <Col lg={4} className="mb-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(0, 0, 0, 0.05)", color: "#333" }}>
              <i className="bi bi-activity fs-4"></i>
            </div>
            <p className="text-stone small text-uppercase font-weight-bold mb-1">Total AR Scans</p>
            <h4 className="mb-0">{analytics?.totalScans || 0}</h4>
            <div className="small text-stone mt-2">Last {days} days</div>
          </div>
        </Col>
        <Col lg={4} className="mb-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(247, 190, 39, 0.12)", color: "var(--admin-yellow)" }}>
              <i className="bi bi-qr-code-scan fs-4"></i>
            </div>
            <p className="text-stone small text-uppercase font-weight-bold mb-1">Sources</p>
            <div className="mt-2">{sourceBadges}</div>
          </div>
        </Col>
        <Col lg={4} className="mb-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(227, 0, 14, 0.10)", color: "var(--admin-accent)" }}>
              <i className="bi bi-download fs-4"></i>
            </div>
            <p className="text-stone small text-uppercase font-weight-bold mb-1">Export</p>
            <div className="d-flex align-items-center gap-2">
              <Button variant="outline-secondary" size="sm" onClick={fetchAnalytics} disabled={loading}>
                <i className="bi bi-arrow-repeat me-2"></i>
                Refresh
              </Button>
              <Button variant="outline-dark" size="sm" onClick={handleExportCsv} disabled={exporting || loading}>
                <i className="bi bi-filetype-csv me-2"></i>
                {exporting ? "Exporting..." : "Export CSV"}
              </Button>
            </div>
            <div className="mt-3">
              <Form.Select size="sm" value={days} onChange={(e) => setDays(Number(e.target.value) || 30)} style={{ maxWidth: 240 }}>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={180}>Last 180 days</option>
              </Form.Select>
            </div>
          </div>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
        <Card.Header className="bg-white border-0 p-4 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 font-weight-bold" style={{ fontFamily: "var(--admin-font-head)", color: "var(--admin-accent)" }}>
            Scans Per Day
          </h5>
          <div className="small text-stone">Last {days} days</div>
        </Card.Header>
        <Card.Body className="p-4">
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" style={{ color: "var(--admin-accent)" }} />
              <p className="mt-3 text-muted">Loading analytics...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="mb-0">{error}</Alert>
          ) : (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#e3000e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>
        <Card.Header className="bg-white border-0 p-4 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 font-weight-bold" style={{ fontFamily: "var(--admin-font-head)", color: "var(--admin-accent)" }}>
            Top Scanned Mushrooms
          </h5>
          <div className="small text-stone">Top 10</div>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="align-middle mb-0">
            <thead className="bg-stone">
              <tr className="small text-stone text-uppercase">
                <th className="py-3 ps-4">Marker</th>
                <th className="py-3">Name</th>
                <th className="py-3 text-end pe-4">Scans</th>
              </tr>
            </thead>
            <tbody>
              {top.map((t) => (
                <tr key={t.markerKey} className="border-bottom">
                  <td className="py-3 ps-4 small font-weight-bold text-dark">{String(t.markerKey || "").toUpperCase()}</td>
                  <td className="py-3">{t.name || "-"}</td>
                  <td className="py-3 text-end pe-4 font-weight-bold">{t.count || 0}</td>
                </tr>
              ))}
              {(!top || top.length === 0) && (
                <tr>
                  <td colSpan={3} className="text-center py-5 text-muted">No scan data yet.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </AdminLayout>
  );
}

