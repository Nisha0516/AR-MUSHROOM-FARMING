import React from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useUser } from '../../context/UserContext';
import { useState } from 'react';
import { userAPI } from '../../services/api';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layouts/Layout';

const Profile = () => {
  const { user, isAuthenticated, login, logout, token, userId } = useUser();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formState, setFormState] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState(null);
  const [pwSuccess, setPwSuccess] = useState(null);
  const [pwSaving, setPwSaving] = useState(false);

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await userAPI.delete(userId);
      if (res && res.success) {
        logout();
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
      } else {
        alert(res.message || 'Failed to delete account.');
      }
    } catch (err) {
      alert(err.message || 'Network error. Could not delete account.');
    } finally {
      setDeleting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);
    if (pwForm.newPw !== pwForm.confirm) {
      setPwError('New passwords do not match.');
      return;
    }
    setPwSaving(true);
    try {
      const res = await userAPI.changePassword(userId, pwForm.current, pwForm.newPw);
      if (res && res.success) {
        setPwSuccess('Password changed successfully!');
        setPwForm({ current: '', newPw: '', confirm: '' });
        setChangingPw(false);
      } else {
        setPwError(res.message || 'Failed to change password.');
      }
    } catch (err) {
      setPwError(err.message || 'Network error.');
    } finally {
      setPwSaving(false);
    }
  };

  
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
                    <Link to="/saved-addresses" className="text-decoration-none text-muted fw-bold p-2 rounded hover-bg-light">
                      <i className="bi bi-geo-alt me-3"></i> Saved Addresses
                    </Link>
                    <Link to="/payment-methods" className="text-decoration-none text-muted fw-bold p-2 rounded hover-bg-light">
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
                      const res = await userAPI.update(userId, payload);
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
                          <Form.Text
                            className="text-primary fw-bold"
                            style={{ cursor: 'pointer', fontSize: '0.8rem' }}
                            onClick={() => { setChangingPw(!changingPw); setPwError(null); setPwSuccess(null); }}
                          >
                            {changingPw ? 'Cancel password change' : 'Change password'}
                          </Form.Text>
                        </Form.Group>
                        {changingPw && (
                          <div className="mt-3 p-3 rounded-3 bg-light border">
                            {pwError && <div className="alert alert-danger py-2 small">{pwError}</div>}
                            {pwSuccess && <div className="alert alert-success py-2 small">{pwSuccess}</div>}
                            <Form onSubmit={handleChangePassword}>
                              <Form.Group className="mb-2">
                                <Form.Label className="small text-muted">Current Password</Form.Label>
                                <Form.Control type="password" placeholder="Current password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} required className="bg-white border py-1" />
                              </Form.Group>
                              <Form.Group className="mb-2">
                                <Form.Label className="small text-muted">New Password</Form.Label>
                                <Form.Control type="password" placeholder="Min 6 characters" value={pwForm.newPw} onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })} required className="bg-white border py-1" />
                              </Form.Group>
                              <Form.Group className="mb-3">
                                <Form.Label className="small text-muted">Confirm New Password</Form.Label>
                                <Form.Control type="password" placeholder="Repeat new password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} required className="bg-white border py-1" />
                              </Form.Group>
                              <Button type="submit" variant="dark" size="sm" className="rounded-pill px-3 fw-bold" disabled={pwSaving}>
                                {pwSaving ? 'Saving...' : 'Update Password'}
                              </Button>
                            </Form>
                          </div>
                        )}
                      </Col>
                    </Row>
                    <hr className="my-4" />
                    <div className="d-flex justify-content-end">
                      {!editing ? (
                        <>
                          <Button variant="outline-primary" className="me-2 rounded-pill px-4 fw-bold" onClick={() => setEditing(true)}>Edit</Button>
                          <Button variant="danger" className="rounded-pill px-4 fw-bold" onClick={handleDeleteAccount} disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Delete Account'}
                          </Button>
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
                    <Button variant="outline-danger" className="rounded-pill px-4 fw-bold mt-2 mt-sm-0" onClick={handleDeleteAccount} disabled={deleting}>
                      {deleting ? 'Deleting...' : 'Delete Account'}
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
