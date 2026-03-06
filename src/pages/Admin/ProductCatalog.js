import React, { useState, useEffect } from "react";
import { Row, Col, Card, Table, Button, Form, Badge, Modal, Spinner, Alert, Image } from "react-bootstrap";
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

    const [formData, setFormData] = useState({ name: "", category: "Kit", price: "", stock: "" });
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const [editFormData, setEditFormData] = useState({ name: "", category: "Kit", price: "", stock: "", description: "" });
    const [editFile, setEditFile] = useState(null);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editError, setEditError] = useState(null);

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
            const payload = {
                name: formData.name,
                description: `A premium ${formData.category.toLowerCase()} added to our cultivation supply store.`,
                image: uploadedFilePath || '/uploads/mush-11.jpg',
                category: formData.category,
                type: 'produce',
                price: parseFloat(formData.price) || 0,
                stock: parseFloat(formData.stock) || 0,
                isAvailable: true,
                rating: 0
            };
            const response = await mushroomAPI.create(payload);
            if (response.success) {
                setShowAddModal(false);
                setFormData({ name: "", category: "Kit", price: "", stock: "" });
                setFile(null);
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
            description: product.description || ""
        });
        setEditFile(null);
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
            const payload = {
                name: editFormData.name,
                description: editFormData.description,
                image: imagePath,
                category: editFormData.category,
                price: parseFloat(editFormData.price) || 0,
                stock: parseFloat(editFormData.stock) || 0,
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

    return (
        <AdminLayout>
            <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                <Card.Header className="bg-white border-0 p-4 d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid var(--admin-border) !important' }}>
                    <h5 className="mb-0 font-weight-bold" style={{ fontFamily: 'var(--admin-font-head)', color: 'var(--admin-accent)' }}>E-Commerce Product Catalog</h5>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="rounded-pill px-4 border-0 shadow-sm"
                        style={{ background: 'var(--admin-accent)', color: 'white', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        <i className="bi bi-plus-lg me-2"></i> Register New Product
                    </Button>
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
                                                src={product.image ? `http://localhost:5000${product.image}` : '/assets/mock/placeholder.jpg'}
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
                                            {product.isAvailable ?
                                                <Badge bg="success" className="px-3 py-2">AVAILABLE</Badge> :
                                                <Badge bg="secondary" className="px-3 py-2">INACTIVE</Badge>
                                            }
                                        </td>
                                        <td className="py-3 font-weight-bold">{product.stock || 0}</td>
                                        <td className="py-3 font-weight-bold">₨ {product.price?.toLocaleString()}</td>
                                        <td className="py-3 text-end pe-4">
                                            <Button size="sm" variant="outline-primary" className="me-2 rounded-pill px-3" onClick={() => openEditModal(product)}>
                                                <i className="bi bi-pencil me-1"></i> Edit
                                            </Button>
                                            <Button size="sm" variant="outline-danger" className="rounded-pill px-3" onClick={() => handleDelete(product._id, product.name)}>
                                                <i className="bi bi-trash me-1"></i> Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {inventory.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted">Database contains no items.</td>
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
                                    src={editProduct.image ? `http://localhost:5000${editProduct.image}` : '/assets/mock/placeholder.jpg'}
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
        </AdminLayout>
    );
};

export default ProductCatalog;
