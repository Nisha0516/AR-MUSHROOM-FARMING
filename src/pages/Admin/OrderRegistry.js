import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form, Badge, InputGroup, Spinner, Alert, Dropdown, DropdownButton } from "react-bootstrap";
import AdminLayout from "./AdminLayout";
import { orderAPI } from "../../services/api";
import "../../styles/AdminStyle.css";

const OrderRegistry = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        try {
            const response = await orderAPI.getAll();
            if (response.success) {
                // Sort by newest first
                const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sortedOrders);
            } else {
                setError("Failed to fetch orders from server.");
            }
        } catch (err) {
            setError("Network error connecting to the database.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await orderAPI.updateStatus(id, newStatus);
            if (res.success) {
                fetchOrders();
            } else {
                alert("Failed to update status: " + res.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error updating status.");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed': return <Badge bg="success-light" className="text-success px-3 py-2">COMPLETED</Badge>;
            case 'Processing': return <Badge bg="primary-light" className="text-primary px-3 py-2">PROCESSING</Badge>;
            case 'Pending': return <Badge bg="warning-light" className="text-warning px-3 py-2">PENDING</Badge>;
            case 'Shipped': return <Badge bg="info-light" className="text-info px-3 py-2">SHIPPED</Badge>;
            case 'Cancelled': return <Badge className="text-danger px-3 py-2" style={{ backgroundColor: 'rgba(227, 0, 14, 0.1)' }}>CANCELLED</Badge>;
            default: return <Badge bg="secondary-light" className="text-secondary px-3 py-2">{status ? status.toUpperCase() : 'UNKNOWN'}</Badge>;
        }
    };

    return (
        <AdminLayout>
            <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                <Card.Header className="bg-white border-0 p-4 d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid var(--admin-border) !important' }}>
                    <h5 className="mb-0 font-weight-bold" style={{ fontFamily: 'var(--admin-font-head)', color: 'var(--admin-accent)' }}>Order Registry & Procurement</h5>
                    <div className="d-flex" style={{ width: '400px' }}>
                        <InputGroup className="bg-light rounded-pill overflow-hidden border-0 shadow-sm">
                            <InputGroup.Text className="bg-transparent border-0 ps-3">
                                <i className="bi bi-search text-muted"></i>
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Search by Client or Order ID..."
                                className="bg-transparent border-0 py-2 shadow-none small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center p-5">
                            <Spinner animation="border" style={{ color: "var(--admin-accent)" }} />
                            <p className="mt-3 text-muted">Synchronizing Registry...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4">
                            <Alert variant="danger">{error}</Alert>
                        </div>
                    ) : (
                        <Table responsive hover className="align-middle mb-0">
                            <thead className="bg-stone">
                                <tr className="small text-stone text-uppercase">
                                    <th className="py-3 ps-4">Order ID</th>
                                    <th className="py-3">Date</th>
                                    <th className="py-3">Client</th>
                                    <th className="py-3">Category</th>
                                    <th className="py-3">Status</th>
                                    <th className="py-3">Total Amount</th>
                                    <th className="py-3 text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.filter(order => {
                                    if (searchTerm === "") return true;
                                    const clientName = order.user?.name || "Guest User";
                                    return clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        order._id.toLowerCase().includes(searchTerm.toLowerCase());
                                }).map((order, idx) => {
                                    // Make safe fallbacks for populated data
                                    const shortId = order._id.substring(order._id.length - 6).toUpperCase();
                                    const dateStr = new Date(order.createdAt).toLocaleDateString();
                                    const clientName = order.user?.name || "Guest User";
                                    const firstItem = order.items && order.items.length > 0 ? order.items[0].mushroom : null;
                                    const productName = firstItem ? firstItem.name : "Custom Item";
                                    const productType = firstItem?.type === 'service' ? 'Service' : 'Product';

                                    return (
                                        <tr key={order._id} className="border-bottom clickable-row">
                                            <td className="py-3 ps-4 font-weight-bold small text-dark">ORD-{shortId}</td>
                                            <td className="py-3 small">{dateStr}</td>
                                            <td className="py-3">
                                                <div className="font-weight-bold">{clientName}</div>
                                                <div className="smaller text-stone">{productName} {order.items.length > 1 ? `+${order.items.length - 1} more` : ''}</div>
                                            </td>
                                            <td className="py-3">
                                                <span className={`small ${productType === 'Service' ? 'text-primary' : 'text-success'}`}>
                                                    <i className={`bi ${productType === 'Service' ? 'bi-display' : 'bi-box'} me-1`}></i>
                                                    {productType}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="py-3 font-weight-bold">₨ {order.totalAmount.toLocaleString()}</td>
                                            <td className="py-3 text-end pe-4">
                                                <DropdownButton 
                                                    id={`dropdown-${order._id}`} 
                                                    title="Update" 
                                                    size="sm"
                                                    variant="outline-secondary"
                                                    align="end"
                                                >
                                                    <Dropdown.Item onClick={() => handleStatusChange(order._id, 'Pending')} disabled={order.status === 'Pending'}>Pending</Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleStatusChange(order._id, 'Processing')} disabled={order.status === 'Processing'}>Processing</Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleStatusChange(order._id, 'Shipped')} disabled={order.status === 'Shipped'}>Shipped</Dropdown.Item>
                                                    <Dropdown.Divider />
                                                    <Dropdown.Item onClick={() => handleStatusChange(order._id, 'Completed')} className="text-success" disabled={order.status === 'Completed'}>Completed</Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleStatusChange(order._id, 'Cancelled')} className="text-danger" disabled={order.status === 'Cancelled'}>Cancelled</Dropdown.Item>
                                                </DropdownButton>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted">No orders found in the registry.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
                <Card.Footer className="bg-white border-0 p-4 d-flex justify-content-between align-items-center">
                    <p className="small text-stone mb-0">Showing {orders.length} total verified orders</p>
                    <div className="d-flex">
                        <Button variant="link" className="text-stone text-decoration-none small me-2">Previous</Button>
                        <Button variant="link" className="text-dark text-decoration-none small font-weight-bold">Next</Button>
                    </div>
                </Card.Footer>
            </Card>
        </AdminLayout>
    );
};

export default OrderRegistry;
