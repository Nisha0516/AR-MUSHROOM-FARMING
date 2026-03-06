import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Badge, Button, Image } from 'react-bootstrap';
import { useUser } from '../../context/UserContext';
import { Navigate, Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import Layout from '../../components/Layouts/Layout';
import { FaPrint, FaBox, FaCaretDown, FaCaretUp } from 'react-icons/fa';

const Orders = () => {
  const { user, isAuthenticated, loading: userLoading } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getUserOrders(user._id);
      if (res.success) {
        setOrders(res.data.reverse()); // Show newest first
      } else {
        setError(res.message);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load order history. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user._id) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'processing': return <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill">Processing</Badge>;
      case 'shipped': return <Badge bg="info" className="px-3 py-2 rounded-pill">Shipped</Badge>;
      case 'delivered': return <Badge bg="success" className="px-3 py-2 rounded-pill">Delivered</Badge>;
      case 'cancelled': return <Badge bg="danger" className="px-3 py-2 rounded-pill">Cancelled</Badge>;
      default: return <Badge bg="secondary" className="px-3 py-2 rounded-pill">{status}</Badge>;
    }
  };

  const handlePrint = (orderId) => {
    // In a real app, this might open a new window with a PDF or a specific print stylesheet
    window.print();
  };

  const toggleExpand = (orderId) => {
    if (expandedOrder === orderId) setExpandedOrder(null);
    else setExpandedOrder(orderId);
  };

  if (userLoading) return null;
  
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
                    <Link to="/profile" className="text-decoration-none text-muted fw-bold p-2 rounded hover-bg-light">
                      <i className="bi bi-person me-3"></i> Profile Details
                    </Link>
                    <Link to="/orders" className="text-decoration-none text-dark fw-bold bg-light p-2 rounded border-start border-3 border-dark">
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
                <h2 style={{ fontWeight: '800', color: '#2c3e50', letterSpacing: '-0.5px' }}>Your Orders</h2>
                <div className="text-muted fw-bold h5 mb-0">{orders.length} Orders</div>
              </div>
              
              {error && <div className="alert alert-danger shadow-sm rounded-3">{error}</div>}
              
              {loading ? (
                <div className="text-center py-5 my-5">
                  <Spinner animation="border" style={{ color: '#2c3e50' }} role="status" />
                  <p className="mt-3 text-muted fw-bold">Synchronizing order registry...</p>
                </div>
              ) : orders.length === 0 ? (
                <Card className="text-center border-0 shadow-sm py-5 rounded-4 bg-white">
                  <Card.Body className="py-5">
                    <i className="bi bi-bag-x display-1 text-muted opacity-50 mb-4 d-block"></i>
                    <h3 style={{ fontWeight: '700', color: '#2c3e50' }}>No Orders Found</h3>
                    <p className="text-muted mb-4 fs-5">You haven't placed any orders yet. Start your cultivation journey today!</p>
                    <Link to="/shop" className="btn btn-dark btn-lg px-5 rounded-pill shadow-sm fw-bold">Browse Supplies</Link>
                  </Card.Body>
                </Card>
              ) : (
                <div className="order-list d-flex flex-column gap-4">
                  {orders.map(order => {
                    const orderDate = new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                    const isExpanded = expandedOrder === order._id;
                    const orderNumber = order._id.substring(18).toUpperCase();

                    return (
                      <Card key={order._id} className="border-0 shadow-sm rounded-4 overflow-hidden order-card print-friendly">
                        {/* Order Header */}
                        <Card.Header className="bg-white border-bottom p-4">
                          <Row className="align-items-center">
                            <Col md={3} xs={6} className="mb-3 mb-md-0">
                              <p className="text-uppercase text-muted small fw-bold mb-1 letter-spacing-1">Order Placed</p>
                              <p className="mb-0 fw-bold">{orderDate}</p>
                            </Col>
                            <Col md={2} xs={6} className="mb-3 mb-md-0">
                              <p className="text-uppercase text-muted small fw-bold mb-1 letter-spacing-1">Total</p>
                              <p className="mb-0 fw-bold">₨{(order.totalAmount || 0).toLocaleString()}</p>
                            </Col>
                            <Col md={3} xs={6}>
                              <p className="text-uppercase text-muted small fw-bold mb-1 letter-spacing-1">Order #</p>
                              <p className="mb-0 fw-bold text-primary font-monospace">{orderNumber}</p>
                            </Col>
                            <Col md={4} xs={6} className="text-md-end text-start">
                              <div className="d-flex flex-column align-items-md-end align-items-start h-100 justify-content-center">
                                {getStatusBadge(order.status)}
                                <Button 
                                  variant="link" 
                                  className="text-decoration-none text-muted p-0 mt-2 small fw-bold d-flex align-items-center"
                                  onClick={() => handlePrint(order._id)}
                                >
                                  <FaPrint className="me-2" /> View/Print Invoice
                                </Button>
                              </div>
                            </Col>
                          </Row>
                        </Card.Header>

                        {/* Order Preview items (Collapsed state) */}
                        <Card.Body className="p-4" style={{ cursor: 'pointer' }} onClick={() => toggleExpand(order._id)}>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex flex-wrap gap-3">
                                {(order.items || []).slice(0, 4).map((item, idx) => (
                                  <div key={idx} className="position-relative">
                                    <Image 
                                      src={item.mushroom && item.mushroom.image ? `http://localhost:5000${item.mushroom.image}` : '/assets/mock/placeholder.jpg'} 
                                      alt="Product product"
                                      width={80} 
                                      height={80} 
                                      className="rounded-3 border object-fit-cover shadow-sm"
                                    />
                                    <Badge bg="dark" className="position-absolute top-0 start-100 translate-middle rounded-circle border border-white border-2">
                                      {item.quantity}
                                    </Badge>
                                  </div>
                                ))}
                                {((order.items || []).length > 4) && (
                                  <div className="d-flex align-items-center justify-content-center bg-light rounded-3 border" style={{ width: 80, height: 80 }}>
                                    <span className="fw-bold text-muted">+{(order.items || []).length - 4}</span>
                                  </div>
                                )}
                            </div>
                            
                            <Button variant="light" className="rounded-circle p-2 shadow-sm border text-muted">
                              {isExpanded ? <FaCaretUp /> : <FaCaretDown />}
                            </Button>
                          </div>
                        </Card.Body>

                        {/* Order Details (Expanded state) */}
                        {isExpanded && (
                          <Card.Footer className="bg-light border-top p-4">
                            <h6 className="fw-bold mb-3 d-flex align-items-center"><FaBox className="me-2 text-muted" /> Package Contents</h6>
                            <div className="d-flex flex-column gap-3 mb-4">
                              {(order.items || []).map((item, idx) => (
                                <Row key={idx} className="align-items-center bg-white p-3 rounded-3 shadow-sm mx-0">
                                  <Col xs={3} sm={2} className="text-center px-0">
                                     <Image 
                                      src={item.mushroom && item.mushroom.image ? `http://localhost:5000${item.mushroom.image}` : '/assets/mock/placeholder.jpg'} 
                                      alt="Product"
                                      width={60} 
                                      height={60} 
                                      className="rounded-2 object-fit-cover"
                                    />
                                  </Col>
                                  <Col xs={6} sm={7}>
                                    <p className="fw-bold mb-1 text-dark truncate-text">{item.mushroom ? item.mushroom.name : 'Product No Longer Available'}</p>
                                    <p className="text-muted small mb-0">Qty: {item.quantity || 1}</p>
                                  </Col>
                                  <Col xs={3} sm={3} className="text-end fw-bold text-dark">
                                    ₨{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                                  </Col>
                                </Row>
                              ))}
                            </div>

                            <Row>
                              <Col md={6}>
                                <h6 className="fw-bold text-muted small text-uppercase letter-spacing-1 mb-2">Delivery Address</h6>
                                <p className="mb-0 text-dark">
                                  {order.shippingAddress?.street}<br/>
                                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br/>
                                  {order.shippingAddress?.country}
                                </p>
                              </Col>
                              <Col md={6} className="text-md-end mt-3 mt-md-0">
                                <h6 className="fw-bold text-muted small text-uppercase letter-spacing-1 mb-2">Payment Information</h6>
                                <p className="mb-0 text-dark">
                                  <i className="bi bi-shield-check text-success me-2"></i>
                                  Razorpay Secure Checkout
                                </p>
                                <p className="small text-muted font-monospace mt-1">TXN_ID: rzp_{order._id.substring(0, 10)}</p>
                              </Col>
                            </Row>
                          </Card.Footer>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      <style>{`
        .letter-spacing-1 { letter-spacing: 1px; }
        .hover-bg-light:hover { background-color: #f8f9fa !important; color: #212529 !important; }
        .truncate-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        @media print {
          body * {
            visibility: hidden;
          }
          .checkout_card, .summary_card, .order-card.print-friendly, .order-card.print-friendly * {
            visibility: visible;
          }
          .order-card.print-friendly {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 1px solid #ddd !important;
            box-shadow: none !important;
          }
          header, footer, .btn, .wishlist {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Orders;
