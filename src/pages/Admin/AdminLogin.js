import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "../../styles/AdminStyle.css";

const AdminLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { loginAdmin } = useAdminAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        const success = loginAdmin(username, password);
        if (!success) {
            setError("Invalid administrative credentials. Access Denied.");
        }
    };

    return (
        <div className="admin-login-page mesh-bg d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={5}>
                        <div className="text-center mb-4">
                            <h2 className="mb-1" style={{ fontWeight: 700, letterSpacing: '1px', color: 'var(--admin-accent)', fontFamily: 'var(--admin-font-head)' }}>FARM MATRIX ADMIN</h2>
                            <p className="text-stone small text-uppercase">Industrial Farming Gateway</p>
                        </div>
                        <Card className="admin-card border-0 p-4 shadow-sm" style={{ borderTop: '4px solid var(--admin-accent) !important' }}>
                            <Card.Body>
                                {error && <Alert variant="danger" className="text-center py-2" style={{ fontSize: '0.9rem' }}>{error}</Alert>}
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3" controlId="formAdminUsername">
                                        <Form.Label className="small text-uppercase font-weight-bold opacity-75" style={{ fontFamily: 'var(--admin-font-head)' }}>Access Identifier</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter ID"
                                            className="bg-light border-0 py-2 px-3 shadow-none"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4" controlId="formAdminPassword">
                                        <Form.Label className="small text-uppercase font-weight-bold opacity-75" style={{ fontFamily: 'var(--admin-font-head)' }}>Secure Token</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="••••••••"
                                            className="bg-light border-0 py-2 px-3 shadow-none"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        className="w-100 py-3 border-0 shadow-sm"
                                        style={{
                                            background: 'var(--admin-accent)',
                                            color: 'white',
                                            borderRadius: '8px',
                                            fontWeight: 700,
                                            fontFamily: 'var(--admin-font-head)',
                                            letterSpacing: '1px'
                                        }}
                                    >
                                        VALIDATE & ENTER
                                    </Button>
                                </Form>
                                <div className="mt-4 text-center">
                                    <p className="small text-stone mb-0">Unauthorized access to internal systems is prohibited.</p>
                                    <p className="small text-stone">© 2026 Mycological Architecture Inc.</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AdminLogin;
