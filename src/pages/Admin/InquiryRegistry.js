import React, { useState, useEffect } from "react";
import { Card, Table, Form, Badge, InputGroup, Spinner, Alert, Dropdown, DropdownButton } from "react-bootstrap";
import AdminLayout from "./AdminLayout";
import { inquiryAPI } from "../../services/api";
import "../../styles/AdminStyle.css";

const InquiryRegistry = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const response = await inquiryAPI.getAll();
            if (response.success) {
                // Sort by newest first
                setInquiries(response.data);
            } else {
                setError("Failed to fetch inquiries from server.");
            }
        } catch (err) {
            setError("Network error connecting to the database.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await inquiryAPI.updateStatus(id, newStatus);
            if (res.success) {
                // Refresh list
                fetchInquiries();
            } else {
                alert("Failed to update status: " + res.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error updating status");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Resolved': return <Badge bg="success-light" className="text-success px-3 py-2">RESOLVED</Badge>;
            case 'In Progress': return <Badge bg="warning-light" className="text-warning px-3 py-2">IN PROGRESS</Badge>;
            case 'New': return <Badge bg="primary-light" className="text-primary px-3 py-2">NEW</Badge>;
            default: return <Badge bg="secondary-light" className="text-secondary px-3 py-2">{status ? status.toUpperCase() : 'UNKNOWN'}</Badge>;
        }
    };

    return (
        <AdminLayout>
            <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                <Card.Header className="bg-white border-0 p-4 d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid var(--admin-border) !important' }}>
                    <h5 className="mb-0 font-weight-bold" style={{ fontFamily: 'var(--admin-font-head)', color: 'var(--admin-accent)' }}>Inquiry Inbox</h5>
                    <div className="d-flex" style={{ width: '400px' }}>
                        <InputGroup className="bg-light rounded-pill overflow-hidden border-0 shadow-sm">
                            <InputGroup.Text className="bg-transparent border-0 ps-3">
                                <i className="bi bi-search text-muted"></i>
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Search by Contact Name or Email..."
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
                            <p className="mt-3 text-muted">Loading Inbox...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4">
                            <Alert variant="danger">{error}</Alert>
                        </div>
                    ) : (
                        <Table responsive hover className="align-middle mb-0">
                            <thead className="bg-stone">
                                <tr className="small text-stone text-uppercase">
                                    <th className="py-3 ps-4">Contact</th>
                                    <th className="py-3">Type</th>
                                    <th className="py-3" style={{ maxWidth: '300px' }}>Message Preview</th>
                                    <th className="py-3">Date</th>
                                    <th className="py-3">Status</th>
                                    <th className="py-3 text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inquiries.filter(inq => 
                                    (inq.name && inq.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                    (inq.email && inq.email.toLowerCase().includes(searchTerm.toLowerCase()))
                                ).map((inq, idx) => {
                                    const dateStr = new Date(inq.createdAt).toLocaleDateString();
                                    const typeStr = inq.service === 'order-support' ? 'Order Support' :
                                                    inq.service === 'product-question' ? 'Product Questions' :
                                                    inq.service === 'bulk-order' ? 'Bulk Mushroom Order' : 'Other';

                                    let msgPreview = inq.message;
                                    if (msgPreview.length > 50) msgPreview = msgPreview.substring(0, 50) + '...';

                                    return (
                                        <tr key={inq._id} className="border-bottom">
                                            <td className="py-3 ps-4">
                                                <div className="font-weight-bold">{inq.name}</div>
                                                <div className="smaller text-stone">{inq.email} <br/> {inq.phone || 'No phone'}</div>
                                            </td>
                                            <td className="py-3 small font-weight-bold text-dark">{typeStr}</td>
                                            <td className="py-3 small text-muted" style={{ maxWidth: '300px' }}>
                                                {msgPreview}
                                            </td>
                                            <td className="py-3 small">{dateStr}</td>
                                            <td className="py-3">
                                                {getStatusBadge(inq.status)}
                                            </td>
                                            <td className="py-3 text-end pe-4">
                                                <DropdownButton 
                                                    id={`dropdown-${inq._id}`} 
                                                    title="Update" 
                                                    size="sm"
                                                    variant="outline-secondary"
                                                    align="end"
                                                >
                                                    <Dropdown.Item onClick={() => handleStatusChange(inq._id, 'New')} disabled={inq.status === 'New'}>Mark as New</Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleStatusChange(inq._id, 'In Progress')} disabled={inq.status === 'In Progress'}>Mark as In Progress</Dropdown.Item>
                                                    <Dropdown.Divider />
                                                    <Dropdown.Item onClick={() => handleStatusChange(inq._id, 'Resolved')} className="text-success" disabled={inq.status === 'Resolved'}>Mark as Resolved</Dropdown.Item>
                                                </DropdownButton>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {inquiries.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">No inquiries currently in inbox.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </AdminLayout>
    );
};

export default InquiryRegistry;
