import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useUser } from '../../context/UserContext';
import { Navigate, Link } from 'react-router-dom';
import Layout from '../../components/Layouts/Layout';
import { userAPI } from '../../services/api';

const SavedAddresses = () => {
  const { user, isAuthenticated, loading, login, token, userId } = useUser();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [formState, setFormState] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || '',
  });

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" />;

  const hasAddress =
    user?.address &&
    (user.address.street ||
      user.address.city ||
      user.address.state ||
      user.address.zipCode ||
      user.address.country);

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSaving(true);
    try {
      const payload = { address: { ...formState } };
      const res = await userAPI.update(userId, payload);
      if (res && res.success) {
        const updatedUser = res.data || { ...user, address: formState };
        if (login) login(updatedUser, token);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setSuccessMsg('Address saved successfully.');
        setEditing(false);
      } else {
        setErrorMsg(res.message || 'Failed to save address.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormState({
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || '',
    });
    setErrorMsg(null);
    setSuccessMsg(null);
    setEditing(false);
  };

  return (
    <Layout>
      <section className="py-5" style={{ minHeight: '80vh', backgroundColor: '#f4f6f8' }}>
        <Container>
          <Row>
            {/* Sidebar Navigation */}
            <Col lg={3} className="mb-4">
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <h5 className="font-weight-bold mb-4">Account Menu</h5>
                  <div className="d-flex flex-column gap-3">
                    <Link to="/profile" className="text-decoration-none text-muted fw-bold p-2 rounded hover-bg-light">
                      <i className="bi bi-person me-3"></i> Profile Details
                    </Link>
                    <Link to="/orders" className="text-decoration-none text-muted fw-bold p-2 rounded hover-bg-light">
                      <i className="bi bi-box-seam me-3"></i> Order History
                    </Link>
                    <Link to="/saved-addresses" className="text-decoration-none text-dark fw-bold bg-light p-2 rounded border-start border-3 border-dark">
                      <i className="bi bi-geo-alt me-3"></i> Saved Addresses
                    </Link>
                    <Link to="/payment-methods" className="text-decoration-none text-muted fw-bold p-2 rounded hover-bg-light">
                      <i className="bi bi-credit-card me-3"></i> Payment Methods
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Main Content */}
            <Col lg={9}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ fontWeight: '800', color: '#2c3e50', letterSpacing: '-0.5px' }}>
                  Saved Addresses
                </h2>
              </div>

              <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Header className="bg-white border-bottom p-4 d-flex align-items-center">
                  <div
                    className="text-white d-flex align-items-center justify-content-center me-3 shadow-sm"
                    style={{
                      width: '50px',
                      height: '50px',
                      fontSize: '1.3rem',
                      backgroundColor: '#34495E',
                      borderRadius: '50%',
                    }}
                  >
                    <i className="bi bi-geo-alt-fill"></i>
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>
                      Default Delivery Address
                    </h5>
                    <p className="text-muted mb-0 small">
                      Used to pre-fill your delivery details at checkout.
                    </p>
                  </div>
                </Card.Header>

                <Card.Body className="p-4 bg-white">
                  {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
                  {successMsg && <div className="alert alert-success">{successMsg}</div>}

                  {!editing && !hasAddress && (
                    <div className="text-center py-4">
                      <i className="bi bi-geo-alt" style={{ fontSize: '3rem', color: '#bdc3c7' }}></i>
                      <p className="text-muted mt-3 mb-4">
                        No saved address yet. Add one to speed up checkout!
                      </p>
                      <Button
                        variant="dark"
                        className="rounded-pill px-4 fw-bold"
                        onClick={() => setEditing(true)}
                      >
                        <i className="bi bi-plus-circle me-2"></i>Add Address
                      </Button>
                    </div>
                  )}

                  {!editing && hasAddress && (
                    <>
                      <div
                        className="p-4 rounded-3 mb-4"
                        style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <p className="mb-1 fw-semibold text-dark">
                              {user.address.street}
                            </p>
                            <p className="mb-1 text-muted">
                              {[user.address.city, user.address.state, user.address.zipCode]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                            <p className="mb-0 text-muted">{user.address.country}</p>
                          </div>
                          <span className="badge bg-dark rounded-pill px-3 py-2">Default</span>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          className="rounded-pill px-4 fw-bold"
                          onClick={() => setEditing(true)}
                        >
                          <i className="bi bi-pencil me-2"></i>Edit
                        </Button>
                      </div>
                    </>
                  )}

                  {editing && (
                    <Form onSubmit={handleSave}>
                      <Row className="mb-3">
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label className="text-muted small fw-bold text-uppercase">
                              Street Address
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g. 12, Gandhi Nagar, MG Road"
                              value={formState.street}
                              onChange={(e) =>
                                setFormState({ ...formState, street: e.target.value })
                              }
                              className="bg-light border-0 py-2"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className="mb-3">
                        <Col md={6} className="mb-3 mb-md-0">
                          <Form.Group>
                            <Form.Label className="text-muted small fw-bold text-uppercase">
                              City
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g. Mumbai"
                              value={formState.city}
                              onChange={(e) =>
                                setFormState({ ...formState, city: e.target.value })
                              }
                              className="bg-light border-0 py-2"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="text-muted small fw-bold text-uppercase">
                              State
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g. Maharashtra"
                              value={formState.state}
                              onChange={(e) =>
                                setFormState({ ...formState, state: e.target.value })
                              }
                              className="bg-light border-0 py-2"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className="mb-4">
                        <Col md={6} className="mb-3 mb-md-0">
                          <Form.Group>
                            <Form.Label className="text-muted small fw-bold text-uppercase">
                              ZIP / Postal Code
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g. 400001"
                              value={formState.zipCode}
                              onChange={(e) =>
                                setFormState({ ...formState, zipCode: e.target.value })
                              }
                              className="bg-light border-0 py-2"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="text-muted small fw-bold text-uppercase">
                              Country
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g. India"
                              value={formState.country}
                              onChange={(e) =>
                                setFormState({ ...formState, country: e.target.value })
                              }
                              className="bg-light border-0 py-2"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <hr className="my-4" />
                      <div className="d-flex justify-content-end gap-2">
                        <Button
                          variant="secondary"
                          className="rounded-pill px-4 fw-bold"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="dark"
                          type="submit"
                          className="rounded-pill px-4 fw-bold"
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Save Address'}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <style>{`
        .hover-bg-light:hover { background-color: #f8f9fa !important; color: #212529 !important; }
      `}</style>
    </Layout>
  );
};

export default SavedAddresses;
