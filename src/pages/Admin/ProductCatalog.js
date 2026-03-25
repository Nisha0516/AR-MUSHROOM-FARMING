import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Form, Badge, Modal, Spinner, Alert, Image, InputGroup } from "react-bootstrap";
import AdminLayout from "./AdminLayout";
import { mushroomAPI, uploadAPI, getAssetUrl } from "../../services/api";
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
    const [showCommonQr, setShowCommonQr] = useState(false);
    const [commonQrDataUrl, setCommonQrDataUrl] = useState("");
    const [normalizing, setNormalizing] = useState(false);
    const [query, setQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [sortBy, setSortBy] = useState("name");

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
            const commonPath = typeof window !== "undefined" ? `${window.location.origin}/qr/QR.png` : `/qr/QR.png`;
            setQrProduct(product);
            setQrDataUrl(commonPath);
            setShowQrModal(true);
        } catch (e) {
            alert("Failed to open QR.");
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
                        <Button
                            onClick={() => {
                                try {
                                    const path = typeof window !== "undefined" ? `${window.location.origin}/qr/QR.png` : `/qr/QR.png`;
                                    setCommonQrDataUrl(path);
                                    setShowCommonQr(true);
                                } catch (e) {
                                    alert('Failed to open common QR.');
                                }
                            }}
                            variant="outline-secondary"
                            className="rounded-pill px-4"
                            style={{ fontWeight: 600, fontSize: '0.85rem' }}
                        >
                            <i className="bi bi-qr-code me-2"></i> Common QR
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body className="p-4">
                    <div className="d-flex flex-column flex-md-row align-items-start justify-content-between admin-catalog-controls mb-3 gap-3">
                        <InputGroup style={{ maxWidth: 520 }}>
                            <Form.Control id="catalog-search" aria-label="Search products by name" placeholder="Search products by name..." value={query} onChange={(e) => setQuery(e.target.value)} />
                            <Button variant="outline-secondary" onClick={() => { setQuery(""); setCategoryFilter("All"); setSortBy("name"); }}>Clear</Button>
                        </InputGroup>

                        <div className="d-flex gap-2">
                            <Form.Select id="catalog-category" aria-label="Filter by category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="me-2">
                                <option value="All">All Categories</option>
                                <option value="Kit">Grow Kit</option>
                                <option value="Supplies">Cultivation Supply</option>
                                <option value="Equipment">Hardware / Equipment</option>
                                <option value="Oyster">Fresh Oyster</option>
                                <option value="Other">Other</option>
                            </Form.Select>
                            <Form.Select id="catalog-sort" aria-label="Sort products" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: 160 }}>
                                <option value="name">Sort: Name</option>
                                <option value="price">Sort: Price</option>
                                <option value="stock">Sort: Stock</option>
                            </Form.Select>
                        </div>
                    </div>
                    {loading ? (
                        <div className="text-center p-5">
                            <Spinner animation="border" style={{ color: "var(--admin-accent)" }} />
                            <p className="mt-3 text-muted">Retrieving Products from Database...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4"><Alert variant="danger">{error}</Alert></div>
                    ) : (
                        <div className="catalog-grid">
                            {inventory && inventory.length > 0 ? (
                                (() => {
                                    const filtered = inventory.filter((p) => {
                                        const matchesQuery = query.trim() === "" || p.name.toLowerCase().includes(query.toLowerCase());
                                        const matchesCategory = categoryFilter === "All" || (p.category || "").toLowerCase() === categoryFilter.toLowerCase();
                                        return matchesQuery && matchesCategory;
                                    }).sort((a, b) => {
                                        if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
                                        if (sortBy === 'stock') return (b.stock || 0) - (a.stock || 0);
                                        return (a.name || '').localeCompare(b.name || '');
                                    });

                                    if (filtered.length === 0) {
                                        return <div className="text-center text-muted w-100 py-5" role="status" aria-live="polite">No products match the filters.</div>;
                                    }

                                    return filtered.map((product) => (
                                        <Card key={product._id} className="product-card">
                                            <Card.Body className="d-flex gap-3 align-items-center p-3">
                                                    <Image src={getAssetUrl(product.image || '/uploads/mush-11.jpg')} alt={product.name} width={92} height={92} className="product-image rounded-3" style={{ objectFit: 'cover' }} />
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <div>
                                                                <div className="fw-bold">{product.name}</div>
                                                                <div className="small text-stone text-capitalize">{product.category}</div>
                                                            </div>
                                                            <div className="text-end d-flex flex-column align-items-end">
                                                                <div className="fw-bold product-price">₨ {product.price?.toLocaleString()}</div>
                                                                <div className="small text-stone product-stock">Stock: {product.stock || 0}</div>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex gap-2 align-items-center mt-2">
                                                            {(product.modelUrl || product.iosModelUrl) ?
                                                                <Badge bg="primary" className="px-3 py-2">AR READY</Badge> :
                                                                <Badge bg="secondary" className="px-3 py-2">NO MODEL</Badge>
                                                            }
                                                            {product.isAvailable ? <Badge bg="success" className="px-3 py-2">AVAILABLE</Badge> : <Badge bg="secondary" className="px-3 py-2">INACTIVE</Badge>}
                                                        </div>
                                                        <div className="d-flex justify-content-end gap-3 mt-3 action-btn-row">
                                                            <div className="action-item text-center">
                                                                    <Button onClick={() => openEditModal(product)} variant="outline-primary" className="action-btn" aria-label={`Edit ${product.name}`} title={`Edit ${product.name}`}>
                                                                        <i className="bi bi-pencil" />
                                                                    </Button>
                                                                    <div className="small mt-1">Edit</div>
                                                                </div>

                                                            <div className="action-item text-center">
                                                                <Button onClick={() => openQrModal(product)} variant="outline-dark" className="action-btn" aria-label={`Show QR for ${product.name}`} title={`Show QR for ${product.name}`}>
                                                                    <i className="bi bi-qr-code" />
                                                                </Button>
                                                                <div className="small mt-1">QR</div>
                                                            </div>

                                                            <div className="action-item text-center">
                                                                <Button onClick={() => handleDelete(product._id, product.name)} variant="outline-danger" className="action-btn" aria-label={`Delete ${product.name}`} title={`Delete ${product.name}`}>
                                                                    <i className="bi bi-trash" />
                                                                </Button>
                                                                <div className="small mt-1">Delete</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                        </Card>
                                    ));
                                })()
                            ) : (
                                <div className="text-center py-5 text-muted">Database contains no items.</div>
                            )}
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* ADD PRODUCT MODAL */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg" className="admin-portal" aria-labelledby="addProductModalLabel">
                <Modal.Header closeButton className="border-0 p-4 pb-0">
                    <Modal.Title id="addProductModalLabel" className="font-weight-bold">Register New Product</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleSubmit} className="add-product-form">
                        {submitError && <Alert variant="danger" className="small">{submitError}</Alert>}

                        <Row className="mb-3">
                            <Col md={4}>
                                <div className="edit-image-card p-3 rounded-3 bg-light text-center">
                                    <Image
                                        src={getAssetUrl(formData.image || '/uploads/mush-11.jpg')}
                                        alt="Preview"
                                        width={180}
                                        height={180}
                                        className="rounded-3 border mb-2"
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <p className="mb-1 fw-bold small">Product Image</p>
                                    <p className="mb-2 text-muted small">Upload an image for the product</p>
                                    <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} className="mt-2" accept=".jpg,.jpeg,.png" />
                                </div>
                            </Col>
                            <Col md={8}>
                                <Row>
                                    <Col md={8}>
                                        <Form.Group>
                                            <Form.Label className="small text-stone text-uppercase font-weight-bold">Product Name</Form.Label>
                                            <Form.Control name="name" value={formData.name} onChange={handleInputChange} className="bg-stone border-0 py-2" placeholder="e.g. Blue Oyster Master Spawn" required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
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

                                <Row className="mt-3">
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

                                <Row className="mt-3">
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
                                            <Form.Label className="small text-stone text-uppercase font-weight-bold">3D Model (GLB) Optional</Form.Label>
                                            <Form.Control type="file" onChange={(e) => setModelFile(e.target.files[0])} className="bg-stone border-0 py-1" accept=".glb" />
                                            <Form.Text className="text-muted small">Used for Android/WebXR + Scene Viewer.</Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">iOS Model (USDZ) Optional</Form.Label>
                                    <Form.Control type="file" onChange={(e) => setIosModelFile(e.target.files[0])} className="bg-stone border-0 py-1" accept=".usdz" />
                                    <Form.Text className="text-muted small">Used for iPhone Quick Look AR.</Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">3D Model URL (optional)</Form.Label>
                                    <Form.Control name="modelUrl" value={formData.modelUrl} onChange={handleInputChange} className="bg-stone border-0 py-2" placeholder="/uploads/model.glb" />
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
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg" className="admin-portal" aria-labelledby="editProductModalLabel">
                <Modal.Header closeButton className="border-0 p-4 pb-0">
                    <Modal.Title id="editProductModalLabel" className="font-weight-bold">✏️ Edit Product</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {editProduct && (
                        <Form onSubmit={handleEditSubmit} className="edit-product-form">
                            {editError && <Alert variant="danger" className="small">{editError}</Alert>}

                            <Row className="mb-3">
                                <Col md={4}>
                                    <div className="edit-image-card p-3 rounded-3 bg-light text-center">
                                        <Image
                                            src={getAssetUrl(editProduct.image || '/uploads/mush-11.jpg')}
                                            alt="Current"
                                            width={180}
                                            height={180}
                                            className="rounded-3 border mb-2"
                                            style={{ objectFit: 'cover' }}
                                        />
                                        <p className="mb-1 fw-bold small">Current Image</p>
                                        <p className="mb-2 text-muted small">Upload a new image to replace it</p>
                                        <Form.Control type="file" onChange={(e) => setEditFile(e.target.files[0])} className="mt-2" accept=".jpg,.jpeg,.png" />
                                    </div>
                                </Col>
                                <Col md={8}>
                                    <Row>
                                        <Col md={8}>
                                            <Form.Group>
                                                <Form.Label className="small text-stone text-uppercase font-weight-bold">Product Name</Form.Label>
                                                <Form.Control name="name" value={editFormData.name} onChange={handleEditInputChange} className="bg-stone border-0 py-2" required />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
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

                                    <Row className="mt-3">
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="small text-stone text-uppercase font-weight-bold">Description</Form.Label>
                                                <Form.Control as="textarea" rows={2} name="description" value={editFormData.description} onChange={handleEditInputChange} className="bg-stone border-0 py-2" />
                                            </Form.Group>
                                        </Col>
                                    </Row>
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

                            <Row className="mb-3">
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
            <Modal show={showQrModal} onHide={() => setShowQrModal(false)} centered aria-labelledby="qrModalLabel">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title id="qrModalLabel" className="font-weight-bold">Product QR</Modal.Title>
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
            {/* COMMON QR MODAL */}
            <Modal show={showCommonQr} onHide={() => setShowCommonQr(false)} centered aria-labelledby="commonQrModalLabel">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title id="commonQrModalLabel" className="font-weight-bold">Common Shop QR</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <div className="fw-bold mb-2">All Products / Shop</div>
                    <div className="text-muted small mb-3">Scan this to open the shop on your phone</div>
                    {commonQrDataUrl ? (
                        <img src={commonQrDataUrl} alt="Common Shop QR" style={{ width: 300, height: 300, borderRadius: 12, background: "#fff", padding: 10 }} />
                    ) : (
                        <div className="text-muted">Generating...</div>
                    )}
                    <div className="text-muted small mt-3">
                        Link: <code>{typeof window !== 'undefined' ? `${window.location.origin}/shop` : '/shop'}</code>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="outline-secondary" className="rounded-pill" onClick={() => setShowCommonQr(false)}>
                        Close
                    </Button>
                    {commonQrDataUrl && (
                        <>
                            <Button variant="light" className="rounded-pill" onClick={() => {
                                const a = document.createElement('a');
                                a.href = commonQrDataUrl;
                                a.download = 'shop-qr.png';
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                            }}>
                                <i className="bi bi-download me-2"></i>Download
                            </Button>
                            <Button variant="dark" className="rounded-pill" onClick={() => {
                                const w = window.open('', '_blank');
                                if (!w) return;
                                w.document.write(`<html><head><title>Shop QR</title></head><body style="display:flex;align-items:center;justify-content:center;margin:0;padding:20px;background:#fff;"><img src="${commonQrDataUrl}" style="max-width:100%;height:auto;border-radius:12px;"/></body></html>`);
                                w.document.close();
                                w.focus();
                                setTimeout(() => { w.print(); }, 300);
                            }}>
                                <i className="bi bi-printer me-2"></i>Print
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </AdminLayout>
    );
};

export default ProductCatalog;
