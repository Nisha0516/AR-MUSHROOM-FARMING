import React, { useState, useEffect } from "react";
import { Row, Col, Card, Table, Button, Form, Badge, Modal, Spinner, Alert, Image } from "react-bootstrap";
import QRCode from "qrcode";
import AdminLayout from "./AdminLayout";
import { mushroomAPI, uploadAPI } from "../../services/api";
import "../../styles/AdminStyle.css";

const ProductCatalog = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({ name: "", category: "Kit", price: "", stock: "", modelUrl: "", iosModelUrl: "", usesText: "" });
    const [file, setFile] = useState(null);
    const [modelFile, setModelFile] = useState(null);
    const [iosModelFile, setIosModelFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const [editFormData, setEditFormData] = useState({ name: "", category: "Kit", price: "", stock: "", description: "", modelUrl: "", iosModelUrl: "", usesText: "" });
    const [editFile, setEditFile] = useState(null);
    const [editModelFile, setEditModelFile] = useState(null);
    const [editIosModelFile, setEditIosModelFile] = useState(null);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editError, setEditError] = useState(null);

    const [showQrModal, setShowQrModal] = useState(false);
    const [qrProduct, setQrProduct] = useState(null);
    const [qrDataUrl, setQrDataUrl] = useState("");
    const [normalizing, setNormalizing] = useState(false);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const response = await mushroomAPI.getAll();
            if (response.success) {
                setInventory(response.data);
            } else {
                setError("Failed to fetch catalog from server.");
            }
        } catch (err) {
            setError("Network error connecting to the database.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInventory(); }, []);

    const handleNormalizeCatalog = async () => {
        if (!window.confirm("Apply fair descriptions, uses, and INR pricing to all products?\n\nThis will overwrite existing values.")) return;
        setNormalizing(true);
        try {
            const res = await mushroomAPI.normalize({ force: true });
            if (!res?.success) throw new Error(res?.message || "Normalization failed.");
            fetchInventory();
            alert(`Updated ${res?.data?.updated || 0} products.`);
        } catch (e) {
            alert(e?.message || "Normalization failed.");
        } finally {
            setNormalizing(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError(null);
        try {
            let uploadedFilePath = null;
            if (file) {
                const uploadRes = await uploadAPI.uploadFile(file);
                if (uploadRes.success) uploadedFilePath = uploadRes.filePath;
                else throw new Error("Failed to upload the image asset.");
            }

            let uploadedModelPath = formData.modelUrl || "";
            if (modelFile) {
                const uploadRes = await uploadAPI.uploadFile(modelFile);
                if (uploadRes.success) uploadedModelPath = uploadRes.filePath;
                else throw new Error("Failed to upload the 3D model (GLB).");
            }

            let uploadedIosModelPath = formData.iosModelUrl || "";
            if (iosModelFile) {
                const uploadRes = await uploadAPI.uploadFile(iosModelFile);
                if (uploadRes.success) uploadedIosModelPath = uploadRes.filePath;
                else throw new Error("Failed to upload the iOS model (USDZ).");
            }
            const payload = {
                name: formData.name,
                description: `A premium ${formData.category.toLowerCase()} added to our cultivation supply store.`,
                uses: String(formData.usesText || "").split("\n").map((x) => x.trim()).filter(Boolean),
                image: uploadedFilePath || '/uploads/mush-11.jpg',
                category: formData.category,
                type: 'produce',
                price: parseFloat(formData.price) || 0,
                stock: parseFloat(formData.stock) || 0,
                isAvailable: true,
                modelUrl: uploadedModelPath,
                iosModelUrl: uploadedIosModelPath,
                rating: 0
            };
            const response = await mushroomAPI.create(payload);
            if (response.success) {
                setShowAddModal(false);
                setFormData({ name: "", category: "Kit", price: "", stock: "", modelUrl: "", iosModelUrl: "", usesText: "" });
                setFile(null);
                setModelFile(null);
                setIosModelFile(null);
                fetchInventory();
            } else {
                setSubmitError(response.message || "Failed to create inventory item.");
            }
        } catch (err) {
            setSubmitError(err.message || "An error occurred during SKU generation.");
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (product) => {
        setEditProduct(product);
        setEditFormData({
            name: product.name || "",
            category: product.category || "Kit",
            price: product.price || "",
            stock: product.stock || "",
            description: product.description || "",
            modelUrl: product.modelUrl || "",
            iosModelUrl: product.iosModelUrl || "",
            usesText: Array.isArray(product.uses) ? product.uses.join("\n") : ""
        });
        setEditFile(null);
        setEditModelFile(null);
        setEditIosModelFile(null);
        setEditError(null);
        setShowEditModal(true);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditSubmitting(true);
        setEditError(null);
        try {
            let imagePath = editProduct.image;
            if (editFile) {
                const uploadRes = await uploadAPI.uploadFile(editFile);
                if (uploadRes.success) imagePath = uploadRes.filePath;
                else throw new Error("Failed to upload the new image.");
            }

            let modelUrl = editFormData.modelUrl || "";
            if (editModelFile) {
                const uploadRes = await uploadAPI.uploadFile(editModelFile);
                if (uploadRes.success) modelUrl = uploadRes.filePath;
                else throw new Error("Failed to upload the new 3D model (GLB).");
            }

            let iosModelUrl = editFormData.iosModelUrl || "";
            if (editIosModelFile) {
                const uploadRes = await uploadAPI.uploadFile(editIosModelFile);
                if (uploadRes.success) iosModelUrl = uploadRes.filePath;
                else throw new Error("Failed to upload the new iOS model (USDZ).");
            }
            const payload = {
                name: editFormData.name,
                description: editFormData.description,
                uses: String(editFormData.usesText || "").split("\n").map((x) => x.trim()).filter(Boolean),
                image: imagePath,
                category: editFormData.category,
                price: parseFloat(editFormData.price) || 0,
                stock: parseFloat(editFormData.stock) || 0,
                modelUrl,
                iosModelUrl,
            };
            const response = await mushroomAPI.update(editProduct._id, payload);
            if (response.success) {
                setShowEditModal(false);
                setEditProduct(null);
                fetchInventory();
            } else {
                setEditError(response.message || "Failed to update product.");
            }
        } catch (err) {
            setEditError(err.message || "An error occurred while saving changes.");
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleDelete = async (productId, productName) => {
        if (!window.confirm(`Are you sure you want to permanently delete "${productName}"?`)) return;
        try {
            await mushroomAPI.delete(productId);
            fetchInventory();
        } catch (err) {
            alert("Failed to delete product.");
        }
    };

    const openQrModal = async (product) => {
        try {
            const payload = typeof window !== "undefined" ? `${window.location.origin}/product/${product._id}` : `PRODUCT:${product._id}`;
            const url = await QRCode.toDataURL(payload, {
                errorCorrectionLevel: "M",
                margin: 2,
                width: 320,
                color: { dark: "#0b0b0e", light: "#ffffff" },
            });
            setQrProduct(product);
            setQrDataUrl(url);
            setShowQrModal(true);
        } catch (e) {
            alert("Failed to generate QR.");
        }
    };

    return (
        <AdminLayout>
            <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                <Card.Header className="bg-white border-0 p-4 d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid var(--admin-border) !important' }}>
                    <h5 className="mb-0 font-weight-bold" style={{ fontFamily: 'var(--admin-font-head)', color: 'var(--admin-accent)' }}>E-Commerce Product Catalog</h5>
                    <div className="d-flex gap-2 flex-wrap justify-content-end">
                        <Button
                            onClick={handleNormalizeCatalog}
                            variant="outline-dark"
                            className="rounded-pill px-4 shadow-sm"
                            disabled={normalizing}
                            style={{ fontWeight: 700, fontSize: '0.85rem' }}
                        >
                            <i className={`bi ${normalizing ? 'bi-hourglass-split' : 'bi-magic'} me-2`}></i>
                            {normalizing ? 'Applying...' : 'Auto Fix Details'}
                        </Button>
                        <Button
                            onClick={() => setShowAddModal(true)}
                            className="rounded-pill px-4 border-0 shadow-sm"
                            style={{ background: 'var(--admin-accent)', color: 'white', fontWeight: 600, fontSize: '0.85rem' }}
                        >
                            <i className="bi bi-plus-lg me-2"></i> Register New Product
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center p-5">
                            <Spinner animation="border" style={{ color: "var(--admin-accent)" }} />
                            <p className="mt-3 text-muted">Retrieving Products from Database...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4"><Alert variant="danger">{error}</Alert></div>
                    ) : (
                        <Table responsive hover className="align-middle mb-0">
                            <thead className="bg-stone">
                                <tr className="small text-stone text-uppercase">
                                    <th className="py-3 ps-4">Image</th>
                                    <th className="py-3">Display Name</th>
                                    <th className="py-3">Category</th>
                                    <th className="py-3 text-center">AR</th>
                                    <th className="py-3 text-center">Status</th>
                                    <th className="py-3">Stock</th>
                                    <th className="py-3">Unit Price</th>
                                    <th className="py-3 text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((product) => (
                                    <tr key={product._id} className="border-bottom">
                                        <td className="py-2 ps-4">
                                            <Image
                                                src={product.image || '/uploads/mush-11.jpg'}
                                                alt={product.name}
                                                width={55}
                                                height={55}
                                                className="rounded-3 border"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </td>
                                        <td className="py-3 font-weight-bold">{product.name}</td>
                                        <td className="py-3 small text-capitalize">{product.category}</td>
                                        <td className="py-3 text-center">
                                            {(product.modelUrl || product.iosModelUrl) ?
                                                <Badge bg="primary" className="px-3 py-2">AR READY</Badge> :
                                                <Badge bg="secondary" className="px-3 py-2">NO MODEL</Badge>
                                            }
                                        </td>
                                        <td className="py-3 text-center">
                                            {product.isAvailable ?
                                                <Badge bg="success" className="px-3 py-2">AVAILABLE</Badge> :
                                                <Badge bg="secondary" className="px-3 py-2">INACTIVE</Badge>
                                            }
                                        </td>
                                        <td className="py-3 font-weight-bold">
                                            {product.stock || 0}
                                            {(product.stock || 0) < 10 && (
                                                <Badge bg="danger" className="ms-2 px-2 py-1" style={{ fontSize: '0.65rem' }}>LOW</Badge>
                                            )}
                                        </td>
                                        <td className="py-3 font-weight-bold">₨ {product.price?.toLocaleString()}</td>
                                        <td className="py-3 text-end pe-4">
                                            <Button size="sm" variant="outline-primary" className="me-2 rounded-pill px-3" onClick={() => openEditModal(product)}>
                                                <i className="bi bi-pencil me-1"></i> Edit
                                            </Button>
                                            <Button size="sm" variant="outline-dark" className="me-2 rounded-pill px-3" onClick={() => openQrModal(product)}>
                                                <i className="bi bi-qr-code me-1"></i> QR
                                            </Button>
                                            <Button size="sm" variant="outline-danger" className="rounded-pill px-3" onClick={() => handleDelete(product._id, product.name)}>
                                                <i className="bi bi-trash me-1"></i> Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {inventory.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5 text-muted">Database contains no items.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* ADD PRODUCT MODAL */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg" className="admin-portal">
                <Modal.Header closeButton className="border-0 p-4 pb-0">
                    <Modal.Title className="font-weight-bold">Register New Product</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        {submitError && <Alert variant="danger" className="small">{submitError}</Alert>}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">Product Name</Form.Label>
                                    <Form.Control name="name" value={formData.name} onChange={handleInputChange} className="bg-stone border-0 py-2" placeholder="e.g. Blue Oyster Master Spawn" required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">Category</Form.Label>
                                    <Form.Select name="category" value={formData.category} onChange={handleInputChange} className="bg-stone border-0 py-2">
                                        <option value="Kit">Grow Kit</option>
                                        <option value="Supplies">Cultivation Supply</option>
                                        <option value="Equipment">Hardware / Equipment</option>
                                        <option value="Oyster">Fresh Oyster</option>
                                        <option value="Other">Other Category</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">Uses (one per line)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="usesText"
                                        value={formData.usesText}
                                        onChange={handleInputChange}
                                        className="bg-stone border-0 py-2"
                                        placeholder={"Home cultivation\nBeginner friendly\nHigh yield"}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">Price (₨)</Form.Label>
                                    <Form.Control type="number" name="price" value={formData.price} onChange={handleInputChange} className="bg-stone border-0 py-2" placeholder="0.00" required />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">Initial Stock</Form.Label>
                                    <Form.Control type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="bg-stone border-0 py-2" placeholder="100" required />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">Product Image</Form.Label>
                                    <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} className="bg-stone border-0 py-1" accept=".jpg,.jpeg,.png" />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">3D Model (GLB) Optional</Form.Label>
                                    <Form.Control type="file" onChange={(e) => setModelFile(e.target.files[0])} className="bg-stone border-0 py-1" accept=".glb" />
                                    <Form.Text className="text-muted small">Used for Android/WebXR + Scene Viewer.</Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">iOS Model (USDZ) Optional</Form.Label>
                                    <Form.Control type="file" onChange={(e) => setIosModelFile(e.target.files[0])} className="bg-stone border-0 py-1" accept=".usdz" />
                                    <Form.Text className="text-muted small">Used for iPhone Quick Look AR.</Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">3D Model URL (optional)</Form.Label>
                                    <Form.Control name="modelUrl" value={formData.modelUrl} onChange={handleInputChange} className="bg-stone border-0 py-2" placeholder="/uploads/model.glb" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">iOS Model URL (optional)</Form.Label>
                                    <Form.Control name="iosModelUrl" value={formData.iosModelUrl} onChange={handleInputChange} className="bg-stone border-0 py-2" placeholder="/uploads/model.usdz" />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-flex justify-content-end">
                            <Button variant="link" className="text-stone text-decoration-none me-3" onClick={() => setShowAddModal(false)} disabled={submitting}>Cancel</Button>
                            <Button type="submit" variant="dark" className="px-4 py-2 border-0 bg-dark shadow-sm" disabled={submitting}>
                                {submitting ? <Spinner animation="border" size="sm" /> : 'Add to Catalog'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* EDIT PRODUCT MODAL */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg" className="admin-portal">
                <Modal.Header closeButton className="border-0 p-4 pb-0">
                    <Modal.Title className="font-weight-bold">✏️ Edit Product</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {editProduct && (
                        <Form onSubmit={handleEditSubmit}>
                            {editError && <Alert variant="danger" className="small">{editError}</Alert>}
                            <div className="mb-4 p-3 rounded-3 bg-light d-flex align-items-center gap-3">
                                <Image
                                    src={editProduct.image || '/uploads/mush-11.jpg'}
                                    alt="Current"
                                    width={80}
                                    height={80}
                                    className="rounded-3 border"
                                    style={{ objectFit: 'cover' }}
                                />
                                <div>
                                    <p className="mb-1 fw-bold small">Current Image</p>
                                    <p className="mb-0 text-muted small">Upload a new image below to replace it</p>
                                </div>
                            </div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small text-stone text-uppercase font-weight-bold">Product Name</Form.Label>
                                        <Form.Control name="name" value={editFormData.name} onChange={handleEditInputChange} className="bg-stone border-0 py-2" required />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small text-stone text-uppercase font-weight-bold">Category</Form.Label>
                                        <Form.Select name="category" value={editFormData.category} onChange={handleEditInputChange} className="bg-stone border-0 py-2">
                                            <option value="Kit">Grow Kit</option>
                                            <option value="Supplies">Cultivation Supply</option>
                                            <option value="Equipment">Hardware / Equipment</option>
                                            <option value="Oyster">Fresh Oyster</option>
                                            <option value="Other">Other Category</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="small text-stone text-uppercase font-weight-bold">Description</Form.Label>
                                        <Form.Control as="textarea" rows={2} name="description" value={editFormData.description} onChange={handleEditInputChange} className="bg-stone border-0 py-2" />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="small text-stone text-uppercase font-weight-bold">Uses (one per line)</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="usesText"
                                            value={editFormData.usesText}
                                            onChange={handleEditInputChange}
                                            className="bg-stone border-0 py-2"
                                            placeholder={"Home cultivation\nBeginner friendly\nHigh yield"}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small text-stone text-uppercase font-weight-bold">Price (₨)</Form.Label>
                                        <Form.Control type="number" name="price" value={editFormData.price} onChange={handleEditInputChange} className="bg-stone border-0 py-2" required />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small text-stone text-uppercase font-weight-bold">Stock</Form.Label>
                                        <Form.Control type="number" name="stock" value={editFormData.stock} onChange={handleEditInputChange} className="bg-stone border-0 py-2" required />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small text-stone text-uppercase font-weight-bold">New Image (optional)</Form.Label>
                                    <Form.Control type="file" onChange={(e) => setEditFile(e.target.files[0])} className="bg-stone border-0 py-1" accept=".jpg,.jpeg,.png" />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">Replace 3D Model (GLB)</Form.Label>
                                    <Form.Control type="file" onChange={(e) => setEditModelFile(e.target.files[0])} className="bg-stone border-0 py-1" accept=".glb" />
                                    <Form.Control name="modelUrl" value={editFormData.modelUrl} onChange={handleEditInputChange} className="bg-stone border-0 py-2 mt-2" placeholder="/uploads/model.glb" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">Replace iOS Model (USDZ)</Form.Label>
                                    <Form.Control type="file" onChange={(e) => setEditIosModelFile(e.target.files[0])} className="bg-stone border-0 py-1" accept=".usdz" />
                                    <Form.Control name="iosModelUrl" value={editFormData.iosModelUrl} onChange={handleEditInputChange} className="bg-stone border-0 py-2 mt-2" placeholder="/uploads/model.usdz" />
                                </Form.Group>
                            </Col>
                        </Row>
                            <div className="d-flex justify-content-end">
                                <Button variant="link" className="text-stone text-decoration-none me-3" onClick={() => setShowEditModal(false)} disabled={editSubmitting}>Cancel</Button>
                                <Button type="submit" variant="dark" className="px-4 py-2 border-0 bg-dark shadow-sm" disabled={editSubmitting}>
                                    {editSubmitting ? <Spinner animation="border" size="sm" /> : '💾 Save Changes'}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Modal.Body>
            </Modal>

            {/* QR MODAL */}
            <Modal show={showQrModal} onHide={() => setShowQrModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="font-weight-bold">Product QR</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <div className="fw-bold mb-2">{qrProduct?.name}</div>
                    <div className="text-muted small mb-3">Scan this from your phone on <code>/scan-product</code></div>
                    {qrDataUrl ? (
                        <img src={qrDataUrl} alt="Product QR" style={{ width: 260, height: 260, borderRadius: 12, background: "#fff", padding: 10 }} />
                    ) : (
                        <div className="text-muted">Generating...</div>
                    )}
                    <div className="text-muted small mt-3">
                        Payload: <code>{qrProduct ? `${window.location.origin}/product/${qrProduct._id}` : ""}</code>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="outline-secondary" className="rounded-pill" onClick={() => setShowQrModal(false)}>
                        Close
                    </Button>
                    <Button variant="dark" className="rounded-pill" onClick={() => window.print()}>
                        <i className="bi bi-printer me-2"></i>Print
                    </Button>
                </Modal.Footer>
            </Modal>
        </AdminLayout>
    );
};

export default ProductCatalog;
