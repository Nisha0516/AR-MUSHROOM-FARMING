import React, { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, InputGroup, Modal, Row, Spinner, Table } from "react-bootstrap";
import AdminLayout from "./AdminLayout";
import { arAPI, uploadAPI } from "../../services/api";
import "../../styles/AdminStyle.css";

const DEFAULT_RANGES = {
  proteinG: { min: 3, max: 5 },
  fiberG: { min: 1, max: 3 },
  vitaminDDV: { min: 5, max: 10 },
  potassiumMg: { min: 250, max: 400 },
};

function toNum(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function safetyBadge(safety) {
  const s = String(safety || "").toLowerCase();
  if (s === "safe") return <Badge bg="success-light" className="text-success px-3 py-2">SAFE</Badge>;
  if (s === "not_safe") return <Badge className="text-danger px-3 py-2" style={{ backgroundColor: "rgba(227, 0, 14, 0.1)" }}>NOT SAFE</Badge>;
  return <Badge bg="secondary-light" className="text-secondary px-3 py-2">UNKNOWN</Badge>;
}

export default function ARMarkerCatalog() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [activeKey, setActiveKey] = useState("");

  const [form, setForm] = useState({
    markerKey: "",
    name: "",
    typeLabel: "",
    safety: "safe",
    image: "",
    benefitsText: "Boosts immunity\nSupports heart health\nRich in antioxidants",
    sketchfabEmbedUrl: "",
    modelSrc: "",
    ranges: { ...DEFAULT_RANGES },
  });

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await arAPI.getAllMushrooms();
      if (res?.success) setItems(Array.isArray(res.data) ? res.data : []);
      else setError(res?.message || "Failed to load AR markers.");
    } catch (e) {
      setError("Network error connecting to the database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();
    if (!q) return items;
    return items.filter((m) => {
      const mk = String(m.markerKey || "").toLowerCase();
      const name = String(m.name || "").toLowerCase();
      const type = String(m.typeLabel || "").toLowerCase();
      return mk.includes(q) || name.includes(q) || type.includes(q);
    });
  }, [items, search]);

  const openCreate = () => {
    setMode("create");
    setActiveKey("");
    setForm({
      markerKey: "",
      name: "",
      typeLabel: "",
      safety: "safe",
      image: "",
      benefitsText: "Boosts immunity\nSupports heart health\nRich in antioxidants",
      sketchfabEmbedUrl: "",
      modelSrc: "",
      ranges: { ...DEFAULT_RANGES },
    });
    setShowModal(true);
  };

  const openEdit = (m) => {
    setMode("edit");
    setActiveKey(m.markerKey);
    setForm({
      markerKey: m.markerKey || "",
      name: m.name || "",
      typeLabel: m.typeLabel || "",
      safety: m.safety || "safe",
      image: m.image || "",
      benefitsText: Array.isArray(m.benefits) ? m.benefits.join("\n") : "",
      sketchfabEmbedUrl: m.sketchfabEmbedUrl || "",
      modelSrc: m.modelSrc || "",
      ranges: {
        proteinG: { ...(m.nutrientRanges?.proteinG || DEFAULT_RANGES.proteinG) },
        fiberG: { ...(m.nutrientRanges?.fiberG || DEFAULT_RANGES.fiberG) },
        vitaminDDV: { ...(m.nutrientRanges?.vitaminDDV || DEFAULT_RANGES.vitaminDDV) },
        potassiumMg: { ...(m.nutrientRanges?.potassiumMg || DEFAULT_RANGES.potassiumMg) },
      },
    });
    setShowModal(true);
  };

  const handleUpload = async (file) => {
    if (!file) return;
    try {
      setSaving(true);
      const res = await uploadAPI.uploadFile(file);
      if (res?.success && res.filePath) {
        setForm((f) => ({ ...f, image: res.filePath }));
      } else {
        setError(res?.message || "Upload failed.");
      }
    } catch (e) {
      setError(e?.message || "Upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const benefits = String(form.benefitsText || "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);

      const payload = {
        markerKey: String(form.markerKey || "").trim(),
        name: String(form.name || "").trim(),
        typeLabel: String(form.typeLabel || "").trim(),
        safety: form.safety === "not_safe" ? "not_safe" : "safe",
        image: String(form.image || "").trim(),
        benefits,
        sketchfabEmbedUrl: String(form.sketchfabEmbedUrl || "").trim(),
        modelSrc: String(form.modelSrc || "").trim(),
        nutrientRanges: {
          proteinG: { min: toNum(form.ranges.proteinG.min, 3), max: toNum(form.ranges.proteinG.max, 5) },
          fiberG: { min: toNum(form.ranges.fiberG.min, 1), max: toNum(form.ranges.fiberG.max, 3) },
          vitaminDDV: { min: toNum(form.ranges.vitaminDDV.min, 5), max: toNum(form.ranges.vitaminDDV.max, 10) },
          potassiumMg: { min: toNum(form.ranges.potassiumMg.min, 250), max: toNum(form.ranges.potassiumMg.max, 400) },
        },
      };

      // Basic range sanity
      for (const k of Object.keys(payload.nutrientRanges)) {
        const r = payload.nutrientRanges[k];
        if (!(r.min <= r.max)) throw new Error(`Invalid range for ${k}: min must be <= max`);
      }

      let res;
      if (mode === "create") res = await arAPI.createMushroom(payload);
      else res = await arAPI.updateMushroom(activeKey, payload);

      if (!res?.success) throw new Error(res?.message || "Save failed.");
      await fetchItems();
      setShowModal(false);
    } catch (e) {
      setError(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (markerKey) => {
    const ok = window.confirm(`Delete marker "${markerKey}"? This will not delete existing scan history.`);
    if (!ok) return;
    setSaving(true);
    setError("");
    try {
      const res = await arAPI.deleteMushroom(markerKey);
      if (!res?.success) throw new Error(res?.message || "Delete failed.");
      await fetchItems();
    } catch (e) {
      setError(e?.message || "Delete failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <Card className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>
        <Card.Header className="bg-white border-0 p-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-1 font-weight-bold" style={{ fontFamily: "var(--admin-font-head)", color: "var(--admin-accent)" }}>
              AR Marker Catalog
            </h5>
            <div className="small text-stone">Add or edit mushrooms used by QR marker scanning</div>
          </div>

          <div className="d-flex align-items-center gap-2" style={{ minWidth: 520 }}>
            <InputGroup className="bg-light rounded-pill overflow-hidden border-0 shadow-sm">
              <InputGroup.Text className="bg-transparent border-0 ps-3">
                <i className="bi bi-search text-muted"></i>
              </InputGroup.Text>
              <Form.Control
                placeholder="Search marker key, name, type..."
                className="bg-transparent border-0 py-2 shadow-none small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Button variant="outline-secondary" size="sm" onClick={fetchItems} disabled={loading}>
              <i className="bi bi-arrow-repeat me-2"></i>
              Refresh
            </Button>
            <Button variant="dark" size="sm" onClick={openCreate}>
              <i className="bi bi-plus-lg me-2"></i>
              Add Marker
            </Button>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" style={{ color: "var(--admin-accent)" }} />
              <p className="mt-3 text-muted">Loading marker catalog...</p>
            </div>
          ) : error ? (
            <div className="p-4">
              <Alert variant="danger" className="mb-0">{error}</Alert>
            </div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="bg-stone">
                <tr className="small text-stone text-uppercase">
                  <th className="py-3 ps-4">Marker</th>
                  <th className="py-3">Mushroom</th>
                  <th className="py-3">Safety</th>
                  <th className="py-3">3D</th>
                  <th className="py-3 text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m._id || m.markerKey} className="border-bottom">
                    <td className="py-3 ps-4 small font-weight-bold text-dark">{String(m.markerKey || "").toUpperCase()}</td>
                    <td className="py-3">
                      <div className="font-weight-bold">{m.name}</div>
                      <div className="smaller text-stone">{m.typeLabel}</div>
                      {m.image ? (
                        <div className="smaller text-stone">
                          <i className="bi bi-image me-1"></i>
                          {m.image}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3">{safetyBadge(m.safety)}</td>
                    <td className="py-3">
                      {m.sketchfabEmbedUrl ? (
                        <Badge bg="primary-light" className="text-primary px-3 py-2">SKETCHFAB</Badge>
                      ) : m.modelSrc ? (
                        <Badge bg="info-light" className="text-info px-3 py-2">GLB</Badge>
                      ) : (
                        <Badge bg="secondary-light" className="text-secondary px-3 py-2">NONE</Badge>
                      )}
                    </td>
                    <td className="py-3 text-end pe-4">
                      <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => openEdit(m)}>
                        Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(m.markerKey)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">No AR markers found.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{mode === "create" ? "Add AR Marker" : "Edit AR Marker"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Marker Key</Form.Label>
                <Form.Control
                  value={form.markerKey}
                  disabled={mode === "edit"}
                  placeholder="button"
                  onChange={(e) => setForm((f) => ({ ...f, markerKey: e.target.value }))}
                />
                <div className="smaller text-stone mt-1">This is encoded into the QR: `MUSHROOM:KEY`</div>
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Mushroom Name</Form.Label>
                <Form.Control value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Type Label</Form.Label>
                <Form.Control
                  value={form.typeLabel}
                  placeholder="Edible, Cultivated"
                  onChange={(e) => setForm((f) => ({ ...f, typeLabel: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Safety</Form.Label>
                <Form.Select value={form.safety} onChange={(e) => setForm((f) => ({ ...f, safety: e.target.value }))}>
                  <option value="safe">Safe</option>
                  <option value="not_safe">Not Safe</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Image Path (optional)</Form.Label>
                <Form.Control
                  value={form.image}
                  placeholder="/uploads/mush-11.jpg"
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Upload Image</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files?.[0])} />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Health Benefits (1 per line)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.benefitsText}
              onChange={(e) => setForm((f) => ({ ...f, benefitsText: e.target.value }))}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Sketchfab Embed URL (optional)</Form.Label>
                <Form.Control
                  value={form.sketchfabEmbedUrl}
                  placeholder="https://sketchfab.com/models/.../embed?... "
                  onChange={(e) => setForm((f) => ({ ...f, sketchfabEmbedUrl: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Local 3D Model Src (optional)</Form.Label>
                <Form.Control
                  value={form.modelSrc}
                  placeholder="/uploads/model.glb"
                  onChange={(e) => setForm((f) => ({ ...f, modelSrc: e.target.value }))}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr />
          <h6 className="mb-3" style={{ fontFamily: "var(--admin-font-head)" }}>Nutrient Ranges (Demo Randomizer)</h6>

          <Row className="g-3">
            <Col md={6}>
              <div className="p-3 bg-light rounded">
                <div className="small font-weight-bold mb-2"><i className="bi bi-lightning-charge me-2"></i>Protein (g)</div>
                <Row>
                  <Col>
                    <Form.Control
                      size="sm"
                      value={form.ranges.proteinG.min}
                      onChange={(e) => setForm((f) => ({ ...f, ranges: { ...f.ranges, proteinG: { ...f.ranges.proteinG, min: e.target.value } } }))}
                    />
                    <div className="smaller text-stone mt-1">Min</div>
                  </Col>
                  <Col>
                    <Form.Control
                      size="sm"
                      value={form.ranges.proteinG.max}
                      onChange={(e) => setForm((f) => ({ ...f, ranges: { ...f.ranges, proteinG: { ...f.ranges.proteinG, max: e.target.value } } }))}
                    />
                    <div className="smaller text-stone mt-1">Max</div>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col md={6}>
              <div className="p-3 bg-light rounded">
                <div className="small font-weight-bold mb-2"><i className="bi bi-tree me-2"></i>Fiber (g)</div>
                <Row>
                  <Col>
                    <Form.Control
                      size="sm"
                      value={form.ranges.fiberG.min}
                      onChange={(e) => setForm((f) => ({ ...f, ranges: { ...f.ranges, fiberG: { ...f.ranges.fiberG, min: e.target.value } } }))}
                    />
                    <div className="smaller text-stone mt-1">Min</div>
                  </Col>
                  <Col>
                    <Form.Control
                      size="sm"
                      value={form.ranges.fiberG.max}
                      onChange={(e) => setForm((f) => ({ ...f, ranges: { ...f.ranges, fiberG: { ...f.ranges.fiberG, max: e.target.value } } }))}
                    />
                    <div className="smaller text-stone mt-1">Max</div>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col md={6}>
              <div className="p-3 bg-light rounded">
                <div className="small font-weight-bold mb-2"><i className="bi bi-brightness-high me-2"></i>Vitamin D (% DV)</div>
                <Row>
                  <Col>
                    <Form.Control
                      size="sm"
                      value={form.ranges.vitaminDDV.min}
                      onChange={(e) => setForm((f) => ({ ...f, ranges: { ...f.ranges, vitaminDDV: { ...f.ranges.vitaminDDV, min: e.target.value } } }))}
                    />
                    <div className="smaller text-stone mt-1">Min</div>
                  </Col>
                  <Col>
                    <Form.Control
                      size="sm"
                      value={form.ranges.vitaminDDV.max}
                      onChange={(e) => setForm((f) => ({ ...f, ranges: { ...f.ranges, vitaminDDV: { ...f.ranges.vitaminDDV, max: e.target.value } } }))}
                    />
                    <div className="smaller text-stone mt-1">Max</div>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col md={6}>
              <div className="p-3 bg-light rounded">
                <div className="small font-weight-bold mb-2"><i className="bi bi-battery-half me-2"></i>Potassium (mg)</div>
                <Row>
                  <Col>
                    <Form.Control
                      size="sm"
                      value={form.ranges.potassiumMg.min}
                      onChange={(e) => setForm((f) => ({ ...f, ranges: { ...f.ranges, potassiumMg: { ...f.ranges.potassiumMg, min: e.target.value } } }))}
                    />
                    <div className="smaller text-stone mt-1">Min</div>
                  </Col>
                  <Col>
                    <Form.Control
                      size="sm"
                      value={form.ranges.potassiumMg.max}
                      onChange={(e) => setForm((f) => ({ ...f, ranges: { ...f.ranges, potassiumMg: { ...f.ranges.potassiumMg, max: e.target.value } } }))}
                    />
                    <div className="smaller text-stone mt-1">Max</div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="dark" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
}

