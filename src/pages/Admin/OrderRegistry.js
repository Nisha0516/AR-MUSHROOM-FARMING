import React, { useState } from "react";
import { Card, Table, Button, Form, Badge, InputGroup } from "react-bootstrap";
import AdminLayout from "./AdminLayout";
import "../../styles/AdminStyle.css";

const OrderRegistry = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const orders = [
        { id: "ORD-9921", date: "2024-11-04", client: "BioAg Corp", product: "AR Software License", status: "Completed", amount: "₨ 15,000", type: "Service" },
        { id: "ORD-9922", date: "2024-11-02", client: "Urban Fungi", product: "Hobbyist Grow Kit x5", status: "Processing", amount: "₨ 7,500", type: "Product" },
        { id: "ORD-9923", date: "2024-11-01", client: "Dr. Aris Veld", product: "Spore Bank Access", status: "Pending", amount: "₨ 5,000", type: "Service" },
        { id: "ORD-9924", date: "2024-10-30", client: "Green Growers", product: "Fresh Oyster Packet x20", status: "Shipped", amount: "₨ 1,300", type: "Product" },
        { id: "ORD-9925", date: "2024-10-28", client: "Fungi Labs", product: "AR Mapping (Room A)", status: "Completed", amount: "₨ 7,500", type: "Service" },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed': return <Badge bg="success-light" className="text-success px-3 py-2">COMPLETED</Badge>;
            case 'Processing': return <Badge bg="primary-light" className="text-primary px-3 py-2">PROCESSING</Badge>;
            case 'Pending': return <Badge bg="warning-light" className="text-warning px-3 py-2">PENDING</Badge>;
            case 'Shipped': return <Badge bg="info-light" className="text-info px-3 py-2">SHIPPED</Badge>;
            default: return <Badge bg="secondary-light" className="text-secondary px-3 py-2">UNKNOWN</Badge>;
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
                    <Table responsive hover className="align-middle mb-0">
                        <thead className="bg-stone">
                            <tr className="small text-stone text-uppercase">
                                <th className="py-3 ps-4">Order ID</th>
                                <th className="py-3">Date</th>
                                <th className="py-3">Client</th>
                                <th className="py-3">Category</th>
                                <th className="py-3">Status</th>
                                <th className="py-3 text-end pe-4">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, idx) => (
                                <tr key={idx} className="border-bottom clickable-row">
                                    <td className="py-3 ps-4 font-weight-bold small text-dark">{order.id}</td>
                                    <td className="py-3 small">{order.date}</td>
                                    <td className="py-3">
                                        <div className="font-weight-bold">{order.client}</div>
                                        <div className="smaller text-stone">{order.product}</div>
                                    </td>
                                    <td className="py-3">
                                        <span className={`small ${order.type === 'Service' ? 'text-primary' : 'text-success'}`}>
                                            <i className={`bi ${order.type === 'Service' ? 'bi-display' : 'bi-box'} me-1`}></i>
                                            {order.type}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        {getStatusBadge(order.status)}
                                    </td>
                                    <td className="py-3 text-end pe-4 font-weight-bold">{order.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
                <Card.Footer className="bg-white border-0 p-4 d-flex justify-content-between align-items-center">
                    <p className="small text-stone mb-0">Showing 5 of 48 total orders</p>
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
