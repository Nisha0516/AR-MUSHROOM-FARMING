import React from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useUser } from '../../context/UserContext';
import { useState } from 'react';
import { userAPI } from '../../services/api';
import { Navigate, Link } from 'react-router-dom';
import Layout from '../../components/Layouts/Layout';

const Profile = () => {
  const { user, isAuthenticated, loading, login, token } = useUser();
  const [editing, setEditing] = useState(false);
  const [formState, setFormState] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  if (loading) return null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

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
                    <Link to="/profile" className="text-decoration-none text-dark fw-bold bg-light p-2 rounded border-start border-3 border-dark">
                      <i className="bi bi-person me-3"></i> Profile Details
                    </Link>
                    <Link to="/orders" className="text-decoration-none text-muted fw-bold p-2 rounded hover-bg-light">
                      <i className="bi bi-box-seam me-3"></i> Order History
                    </Link>
                    <Link to="#" className="text-decoration-none text-muted fw-bold p-2 rounded hover-bg-light">
                      <i className="bi bi-geo-alt me-3"></i> Saved Addresses
                    </Link>
                    <Link to="#" className="text-decoration-none text-muted fw-bold p-2 rounded hover-bg-light">
                      <i className="bi bi-credit-card me-3"></i> Payment Methods
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Main Content Area */}
            <Col lg={9}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ fontWeight: '800', color: '#2c3e50', letterSpacing: '-0.5px' }}>Profile Details</h2>
              </div>

              <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <Card.Header className="bg-white border-bottom p-4 d-flex align-items-center">
                   <div className="text-white d-flex align-items-center justify-content-center me-3 shadow-sm" 
                         style={{ 
                             width: '60px', 
                             height: '60px', 
                             fontSize: '1.5rem',
                             backgroundColor: '#34495E',
                             borderRadius: '50%'
                         }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="mb-1" style={{ fontWeight: '700', color: '#2c3e50' }}>{user.name}</h4>
                      <p className="text-muted mb-0 small">Mushroom Enthusiast (Customer via Razorpay)</p>
                    </div>
                </Card.Header>
                <Card.Body className="p-4 bg-white">
                  <Form onSubmit={async (e) => {
                    e.preventDefault();
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setSaving(true);
                    try {
                      const payload = {
                        name: formState.name,
                        email: formState.email,
                        phone: formState.phone
                      };
                      const res = await userAPI.update(user._id, payload);
                      if (res && res.success) {
                        // Update context and localStorage
                        const updatedUser = res.data || { ...user, ...payload };
                        if (login) login(updatedUser, token);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        setSuccessMsg('Profile updated successfully.');
                        setEditing(false);
                      } else {
                        setErrorMsg(res.message || 'Failed to update profile.');
                      }
                    } catch (err) {
                      setErrorMsg(err.message || 'Network error.');
                    } finally {
                      setSaving(false);
                    }
                  }}>
                    {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
                    {successMsg && <div className="alert alert-success">{successMsg}</div>}

                    <Row className="mb-4">
                      <Col md={6} className="mb-3 mb-md-0">
                        <Form.Group>
                          <Form.Label className="text-muted small fw-bold text-uppercase">Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={formState.name}
                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                            className="bg-light border-0 py-2 fw-medium"
                            readOnly={!editing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="text-muted small fw-bold text-uppercase">Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            value={formState.email}
                            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                            className="bg-light border-0 py-2 fw-medium text-muted"
                            readOnly={!editing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-4">
                      <Col md={6} className="mb-3 mb-md-0">
                        <Form.Group>
                          <Form.Label className="text-muted small fw-bold text-uppercase">Phone Number</Form.Label>
                          <Form.Control
                            type="text"
                            value={formState.phone}
                            onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                            placeholder="Phone Number"
                            className="bg-light border-0 py-2 fw-medium text-muted"
                            readOnly={!editing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="text-muted small fw-bold text-uppercase">Account Security</Form.Label>
                          <Form.Control type="password" defaultValue="********" className="bg-light border-0 py-2 fw-medium text-muted" readOnly />
                          <Form.Text className="text-primary fw-bold" style={{ cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => alert('Password reset link sent to your email (demo).')}>Request password reset</Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                    <hr className="my-4" />
                    <div className="d-flex justify-content-end">
                      {!editing ? (
                        <>
                          <Button variant="outline-primary" className="me-2 rounded-pill px-4 fw-bold" onClick={() => setEditing(true)}>Edit</Button>
                          <Button variant="danger" className="rounded-pill px-4 fw-bold" onClick={() => {
                            if (window.confirm('Are you sure you want to delete your account? This is irreversible.')) {
                              // Keep current behavior: placeholder
                              alert('Account deletion not implemented in demo.');
                            }
                          }}>Delete Account</Button>
                        </>
                      ) : (
                        <>
                          <Button variant="secondary" className="me-2 rounded-pill px-4 fw-bold" onClick={() => { setEditing(false); setFormState({ name: user.name, email: user.email, phone: user.phone || '' }); setErrorMsg(null); setSuccessMsg(null); }}>Cancel</Button>
                          <Button variant="dark" type="submit" className="rounded-pill px-4 fw-bold" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                        </>
                      )}
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              {/* Danger Zone */}
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Body className="p-4 border-start border-4 border-danger bg-white">
                  <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <div>
                      <h5 className="fw-bold text-danger mb-1">Delete Account</h5>
                      <p className="text-muted small mb-0">Permanently delete your account and all order history data.</p>
                    </div>
                    <Button variant="outline-danger" className="rounded-pill px-4 fw-bold mt-2 mt-sm-0">
                      Delete Account
                    </Button>
                  </div>
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

export default Profile;
