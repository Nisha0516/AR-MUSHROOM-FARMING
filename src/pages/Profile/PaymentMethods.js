import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useUser } from '../../context/UserContext';
import { Navigate, Link } from 'react-router-dom';
import Layout from '../../components/Layouts/Layout';

const PaymentMethods = () => {
  const { isAuthenticated, loading } = useUser();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" />;

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
                    <Link to="/saved-addresses" className="text-decoration-none text-muted fw-bold p-2 rounded hover-bg-light">
                      <i className="bi bi-geo-alt me-3"></i> Saved Addresses
                    </Link>
                    <Link to="/payment-methods" className="text-decoration-none text-dark fw-bold bg-light p-2 rounded border-start border-3 border-dark">
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
                  Payment Methods
                </h2>
              </div>

              {/* Razorpay Info Card */}
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <Card.Header className="bg-white border-bottom p-4 d-flex align-items-center">
                  <div
                    className="text-white d-flex align-items-center justify-content-center me-3 shadow-sm"
                    style={{
                      width: '50px',
                      height: '50px',
                      fontSize: '1.3rem',
                      backgroundColor: '#072654',
                      borderRadius: '50%',
                    }}
                  >
                    <i className="bi bi-shield-lock-fill"></i>
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>
                      Razorpay Secure Payments
                    </h5>
                    <p className="text-muted mb-0 small">
                      Your payment details are encrypted and managed by Razorpay.
                    </p>
                  </div>
                </Card.Header>
                <Card.Body className="p-4 bg-white">
                  {/* Accepted Methods */}
                  <p className="text-muted small fw-bold text-uppercase mb-3">Accepted Payment Methods</p>
                  <div className="d-flex flex-wrap gap-3 mb-4">
                    {[
                      { icon: 'bi-credit-card-2-front', label: 'Credit / Debit Cards' },
                      { icon: 'bi-phone', label: 'UPI (GPay, PhonePe, Paytm)' },
                      { icon: 'bi-bank', label: 'Net Banking' },
                      { icon: 'bi-wallet2', label: 'Wallets' },
                    ].map((method) => (
                      <div
                        key={method.label}
                        className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                        style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}
                      >
                        <i className={`bi ${method.icon} text-dark`} style={{ fontSize: '1.1rem' }}></i>
                        <span className="fw-medium small text-dark">{method.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Security note */}
                  <div
                    className="p-4 rounded-3 d-flex align-items-start gap-3"
                    style={{ backgroundColor: '#eaf7f0', border: '1px solid #b2dfdb' }}
                  >
                    <i className="bi bi-info-circle-fill text-success mt-1" style={{ fontSize: '1.2rem' }}></i>
                    <div>
                      <p className="mb-1 fw-semibold text-dark">Why can't I save card details here?</p>
                      <p className="mb-0 text-muted small">
                        For your security, card numbers and payment credentials are <strong>never stored</strong> on our servers.
                        All payment information is handled directly by <strong>Razorpay</strong> — a PCI-DSS Level 1 certified
                        payment gateway. You can manage saved cards via the Razorpay checkout window at the time of payment.
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Go to Shop CTA */}
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Body className="p-4 d-flex justify-content-between align-items-center flex-wrap gap-3 bg-white">
                  <div>
                    <h6 className="fw-bold text-dark mb-1">Ready to place an order?</h6>
                    <p className="text-muted small mb-0">
                      Razorpay supports saving your preferred payment method during checkout for faster future payments.
                    </p>
                  </div>
                  <Button
                    as={Link}
                    to="/shop"
                    variant="dark"
                    className="rounded-pill px-4 fw-bold"
                  >
                    <i className="bi bi-bag me-2"></i>Shop Now
                  </Button>
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

export default PaymentMethods;
