import React, { useState } from "react";
import { Row, Col, Card, Table, Button, Form, Badge, Modal } from "react-bootstrap";
import AdminLayout from "./AdminLayout";
import "../../styles/AdminStyle.css";

const ProductCatalog = () => {
    const [showModal, setShowModal] = useState(false);

    const products = [
        { id: "SKU-001", name: "Hobbyist Grow Kit", category: "Kits", stock: 124, price: "₨ 1,500", arStatus: "Active", model: "GrowKit_v2.glb" },
        { id: "SKU-002", name: "Spore Bank Access", category: "Digital", stock: "∞", price: "₨ 5,000", arStatus: "N/A", model: "None" },
        { id: "SKU-003", name: "AR Farm Software", category: "Digital", stock: "∞", price: "₨ 15,000", arStatus: "Active", model: "Dashboard_v1.glb" },
        { id: "SKU-004", name: "Fresh Oyster Packet", category: "Produce", stock: 450, price: "₨ 15", arStatus: "Active", model: "Oyster_v4.glb" },
        { id: "SKU-005", name: "King Oyster Fresh", category: "Produce", stock: 210, price: "₨ 25", arStatus: "Active", model: "King_v1.glb" },
    ];

    return (
        <AdminLayout>
            <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                <Card.Header className="bg-white border-0 p-4 d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid var(--admin-border) !important' }}>
                    <h5 className="mb-0 font-weight-bold" style={{ fontFamily: 'var(--admin-font-head)', color: 'var(--admin-accent)' }}>Industrial Catalog Management</h5>
                    <Button
                        onClick={() => setShowModal(true)}
                        className="rounded-pill px-4 border-0 shadow-sm"
                        style={{ background: 'var(--admin-accent)', color: 'white', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        <i className="bi bi-plus-lg me-2"></i> Register New Industrial SKU
                    </Button>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive hover className="align-middle mb-0">
                        <thead className="bg-stone">
                            <tr className="small text-stone text-uppercase">
                                <th className="py-3 ps-4">SKU Identifier</th>
                                <th className="py-3">Display Name</th>
                                <th className="py-3">Inventory Class</th>
                                <th className="py-3 text-center">AR Asset Status</th>
                                <th className="py-3">Stock Level</th>
                                <th className="py-3 text-end pe-4">Unit Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, idx) => (
                                <tr key={idx} className="border-bottom">
                                    <td className="py-3 ps-4 font-weight-bold small text-dark">{product.id}</td>
                                    <td className="py-3">
                                        <div className="font-weight-bold">{product.name}</div>
                                        <div className="smaller text-stone">{product.model}</div>
                                    </td>
                                    <td className="py-3 small">{product.category}</td>
                                    <td className="py-3 text-center">
                                        {product.arStatus === 'Active' ?
                                            <Badge bg="success-light" className="text-success px-3 py-2">DEPLOYED</Badge> :
                                            <Badge bg="secondary-light" className="text-secondary px-3 py-2">INACTIVE</Badge>
                                        }
                                    </td>
                                    <td className="py-3 font-weight-bold">{product.stock}</td>
                                    <td className="py-3 text-end pe-4 font-weight-bold">{product.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" className="admin-portal">
                <Modal.Header closeButton className="border-0 p-4 pb-0">
                    <Modal.Title className="font-weight-bold">Register Industrial SKU</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">Product Name</Form.Label>
                                    <Form.Control className="bg-stone border-0 py-2" placeholder="e.g. Blue Oyster High-Yield Spawn" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">Category</Form.Label>
                                    <Form.Select className="bg-stone border-0 py-2">
                                        <option>Select class...</option>
                                        <option>Fresh Produce</option>
                                        <option>Grow Kits</option>
                                        <option>Digital Assets</option>
                                        <option>Consultancy Service</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">Industrial Price (₨)</Form.Label>
                                    <Form.Control type="number" className="bg-stone border-0 py-2" placeholder="0.00" />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">Initial Stock</Form.Label>
                                    <Form.Control type="number" className="bg-stone border-0 py-2" placeholder="100" />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small text-stone text-uppercase font-weight-bold">AR Model Integration</Form.Label>
                                    <Form.Control type="file" className="bg-stone border-0 py-1" />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-flex justify-content-end">
                            <Button variant="link" className="text-stone text-decoration-none me-3" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button variant="dark" className="px-4 py-2 border-0 bg-dark shadow-sm">Commit SKU to Registry</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </AdminLayout>
    );
};

export default ProductCatalog;
