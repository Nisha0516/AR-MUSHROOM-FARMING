import React from "react";
import { Row, Col, Card, Table, ProgressBar } from "react-bootstrap";
import AdminLayout from "./AdminLayout";
import "../../styles/AdminStyle.css";

const DashboardHome = () => {
    // Simulated Metrics
    const recentOrders = [
        { id: "ORD-9921", client: "BioAg Corp", product: "AR Software License", status: "Completed", amount: "₨ 15,000" },
        { id: "ORD-9922", client: "Urban Fungi", product: "Hobbyist Grow Kit x5", status: "Processing", amount: "₨ 7,500" },
        { id: "ORD-9923", client: "Dr. Aris Veld", product: "Spore Bank Access", status: "Pending", amount: "₨ 5,000" },
        { id: "ORD-9924", client: "Green Growers", product: "Fresh Oyster Packet x20", status: "Shipped", amount: "₨ 1,300" },
    ];

    return (
        <AdminLayout>
            <Row className="mb-4">
                <Col md={3} className="mb-4">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(227, 0, 14, 0.1)', color: 'var(--admin-accent)' }}>
                            <i className="bi bi-currency-dollar fs-4"></i>
                        </div>
                        <p className="text-stone small text-uppercase font-weight-bold mb-1">Monthly Revenue</p>
                        <h4 className="mb-0">₨ 842,500</h4>
                        <div className="small text-success mt-2">
                            <i className="bi bi-graph-up-arrow me-1"></i> +12% from last month
                        </div>
                    </div>
                </Col>
                <Col md={3} className="mb-4">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(247, 190, 39, 0.1)', color: 'var(--admin-yellow)' }}>
                            <i className="bi bi-cart-fill fs-4"></i>
                        </div>
                        <p className="text-stone small text-uppercase font-weight-bold mb-1">Active Orders</p>
                        <h4 className="mb-0">128</h4>
                        <div className="small text-stone mt-2">
                            8 Pending verification
                        </div>
                    </div>
                </Col>
                <Col md={3} className="mb-4">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(100, 47, 33, 0.1)', color: 'var(--bg-coffee)' }}>
                            <i className="bi bi-moisture fs-4"></i>
                        </div>
                        <p className="text-stone small text-uppercase font-weight-bold mb-1">Avg. Humidity</p>
                        <h4 className="mb-0">84%</h4>
                        <div className="small text-danger mt-2">
                            <i className="bi bi-exclamation-triangle-fill me-1"></i> High saturation
                        </div>
                    </div>
                </Col>
                <Col md={3} className="mb-4">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(0, 0, 0, 0.05)', color: '#333' }}>
                            <i className="bi bi-shield-check fs-4"></i>
                        </div>
                        <p className="text-stone small text-uppercase font-weight-bold mb-1">System Health</p>
                        <h4 className="mb-0">Stable</h4>
                        <div className="small text-success mt-2">
                            Uptime: 99.9%
                        </div>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                        <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
                            <h5 className="font-weight-bold">Recent Procurement Activity</h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Table responsive borderless className="align-middle">
                                <thead className="bg-stone">
                                    <tr className="small text-stone text-uppercase">
                                        <th className="py-3">Order ID</th>
                                        <th className="py-3">Client</th>
                                        <th className="py-3">Product/Service</th>
                                        <th className="py-3">Status</th>
                                        <th className="py-3 text-end">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order, idx) => (
                                        <tr key={idx} className="border-bottom">
                                            <td className="py-3 font-weight-bold small">{order.id}</td>
                                            <td className="py-3">{order.client}</td>
                                            <td className="py-3 small">{order.product}</td>
                                            <td className="py-3">
                                                <span className={`badge rounded-pill px-3 py-2 ${order.status === 'Completed' ? 'bg-success-light text-success' :
                                                    order.status === 'Processing' ? 'bg-primary-light text-primary' :
                                                        order.status === 'Pending' ? 'bg-warning-light text-warning' : 'bg-info-light text-info'
                                                    }`} style={{ fontSize: '0.7rem' }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-end font-weight-bold">{order.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                        <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
                            <h5 className="font-weight-bold">Farm Environmental Status</h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <div className="mb-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small font-weight-bold">Incubation Room Humidity</span>
                                    <span className="small text-success">92%</span>
                                </div>
                                <ProgressBar variant="success" now={92} style={{ height: '8px' }} />
                            </div>
                            <div className="mb-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small font-weight-bold">Laboratory Temperature</span>
                                    <span className="small text-primary">22.4°C</span>
                                </div>
                                <ProgressBar variant="primary" now={75} style={{ height: '8px' }} />
                            </div>
                            <div className="mb-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small font-weight-bold">CO2 Concentration</span>
                                    <span className="small text-warning">840 ppm</span>
                                </div>
                                <ProgressBar variant="warning" now={60} style={{ height: '8px' }} />
                            </div>
                            <hr className="my-4" />
                            <h6 className="font-weight-bold mb-3" style={{ fontFamily: 'var(--admin-font-head)' }}>Live Pulse Activity</h6>
                            <div className="pulse-feed small">
                                <div className="pulse-item d-flex mb-3">
                                    <div className="pulse-indicator me-3" style={{ background: 'var(--admin-yellow)', border: '2px solid rgba(247, 190, 39, 0.3)' }}></div>
                                    <div>
                                        <p className="mb-0 font-weight-bold">Zone B Spore Alert</p>
                                        <p className="smaller text-muted mb-0">Humidity spike detected: 92% @ 10:48 PM</p>
                                    </div>
                                </div>
                                <div className="pulse-item d-flex mb-3">
                                    <div className="pulse-indicator me-3" style={{ background: 'var(--admin-accent)', border: '2px solid rgba(227, 0, 14, 0.3)' }}></div>
                                    <div>
                                        <p className="mb-0 font-weight-bold">Procurement Sync</p>
                                        <p className="smaller text-muted mb-0">Client ORD-9921 verification complete.</p>
                                    </div>
                                </div>
                                <div className="pulse-item d-flex mb-0 opacity-50">
                                    <div className="pulse-indicator me-3" style={{ background: '#333', border: '2px solid rgba(0, 0, 0, 0.1)' }}></div>
                                    <div>
                                        <p className="mb-0 font-weight-bold">System Pulse</p>
                                        <p className="smaller text-muted mb-0">AR-Matrix Gateway heartbeat: STABLE</p>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </AdminLayout>
    );
};

export default DashboardHome;
