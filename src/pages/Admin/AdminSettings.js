import React from "react";
import { Row, Col, Card, Form, Button } from "react-bootstrap";
import AdminLayout from "./AdminLayout";
import "../../styles/AdminStyle.css";

const AdminSettings = () => {
    return (
        <AdminLayout>
            <Row>
                <Col md={8}>
                    <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                        <Card.Header className="bg-white border-0 p-4">
                            <h5 className="mb-0 font-weight-bold" style={{ fontFamily: 'var(--admin-font-head)', color: 'var(--admin-accent)' }}>System Configuration</h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Form>
                                <Form.Group className="mb-4">
                                    <Form.Label className="small text-muted text-uppercase font-weight-bold" style={{ fontFamily: 'var(--admin-font-head)', letterSpacing: '0.5px' }}>Farm Identification Name</Form.Label>
                                    <Form.Control className="bg-light border-0 py-2 shadow-none" defaultValue="Mushroom Matrix HQ" />
                                </Form.Group>

                                <Row className="mb-4">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted text-uppercase font-weight-bold" style={{ fontFamily: 'var(--admin-font-head)', letterSpacing: '0.5px' }}>Sensor Module Sensitivity</Form.Label>
                                            <Form.Range defaultValue={80} variant="danger" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted text-uppercase font-weight-bold" style={{ fontFamily: 'var(--admin-font-head)', letterSpacing: '0.5px' }}>Data Sync Interval</Form.Label>
                                            <Form.Select className="bg-light border-0 py-2 shadow-none">
                                                <option>Real-time (Stream)</option>
                                                <option>5 Minutes</option>
                                                <option>15 Minutes</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <hr className="my-4" style={{ opacity: 0.1 }} />

                                <h6 className="font-weight-bold mb-3 text-danger" style={{ fontFamily: 'var(--admin-font-head)' }}>Hazardous Operations</h6>
                                <div className="p-3 bg-light rounded mb-4" style={{ borderLeft: '4px solid var(--admin-accent)' }}>
                                    <p className="small text-danger mb-2 font-weight-bold">Reset All Spore Bank Permissions</p>
                                    <p className="smaller text-muted mb-3">This action will immediately revoke all external API access to the genetic repository.</p>
                                    <Button variant="outline-danger" size="sm" className="font-weight-bold">INITIATE EMERGENCY RESET</Button>
                                </div>

                                <div className="text-end">
                                    <Button className="px-5 py-2 border-0 shadow-sm" style={{ background: 'var(--admin-accent)', color: 'white', fontWeight: 600, fontFamily: 'var(--admin-font-head)', letterSpacing: '1px' }}>Save Configuration</Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                        <Card.Body className="p-4">
                            <h6 className="font-weight-bold mb-3" style={{ fontFamily: 'var(--admin-font-head)' }}>Gateway Status</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="small text-muted">Auth Provider</span>
                                <span className="small font-weight-bold text-success">Dedicated Registry</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4">
                                <span className="small text-muted">Encryption</span>
                                <span className="small font-weight-bold">AES-256</span>
                            </div>
                            <Button variant="outline-dark" className="w-100 py-2 small font-weight-bold" style={{ borderColor: 'var(--admin-yellow)', color: 'var(--admin-text)' }}>Download Access Logs</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </AdminLayout>
    );
};

export default AdminSettings;
