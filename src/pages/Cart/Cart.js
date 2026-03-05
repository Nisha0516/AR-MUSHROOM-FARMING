import React, { useContext, useState } from "react";
import { Container, Row, Col, Table, Button, Modal } from "react-bootstrap";
import Layout from "../../components/Layouts/Layout";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import ARViewer from "../../components/ARViewer";
import "../../styles/HomeStyle.css";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useContext(CartContext);
  const [showAR, setShowAR] = useState(false);
  const [activeModel, setActiveModel] = useState({ url: "", title: "" });

  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const navigate = useNavigate();
  const hasProduce = cartItems.some(item => item.id.includes('p00'));

  const handleProceed = () => {
    navigate("/checkout");
  };

  return (
    <Layout>
      <section className="cart_section py-5">
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="cart_title">{hasProduce ? "Your Shopping Cart" : "Your Project Cart"}</h2>
            </Col>
          </Row>

          {cartItems.length > 0 ? (
            <Row>
              <Col lg={8}>
                <div className="table-responsive">
                  <Table striped hover className="cart_table shadow-sm">
                    <thead>
                      <tr>
                        <th>{hasProduce ? "Item" : "Asset/Service"}</th>
                        <th>Rate</th>
                        <th>Qty</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.id}>
                          <td className="cart_product">{item.title}</td>
                          <td>₨{item.price}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.id, parseInt(e.target.value))
                              }
                              className="cart_qty"
                            />
                          </td>
                          <td>₨{item.total}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {item.modelUrl && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => {
                                    setActiveModel({ url: item.modelUrl, title: item.title });
                                    setShowAR(true);
                                  }}
                                  style={{ borderColor: 'var(--yellow)', color: 'var(--light-black)' }}
                                >
                                  <i className="bi bi-badge-3d me-1"></i>3D Preview
                                </Button>
                              )}
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                style={{ backgroundColor: 'var(--light-red)', borderColor: 'var(--light-red)' }}
                              >
                                Remove
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Col>

              <Col lg={4}>
                <div className="cart_summary p-4 border rounded shadow-sm">
                  <h4 className="mb-4">{hasProduce ? "Order Summary" : "Project Summary"}</h4>
                  <div className="summary_item d-flex justify-content-between mb-3">
                    <span>Subtotal:</span>
                    <span>₨{subtotal}</span>
                  </div>
                  <div className="summary_item d-flex justify-content-between mb-3">
                    <span>{hasProduce ? "Delivery Fee:" : "Handling/Setup:"}</span>
                    <span>{shipping === 0 ? (hasProduce ? "FREE" : "WAIVED") : `₨${shipping}`}</span>
                  </div>
                  <div className="summary_item d-flex justify-content-between mb-3 pb-3 border-bottom">
                    <span>Tax (10%):</span>
                    <span>₨{tax.toFixed(2)}</span>
                  </div>
                  <div className="summary_item d-flex justify-content-between mb-4">
                    <h5 style={{ color: 'var(--light-black)' }}>Total Estimate:</h5>
                    <h5 className="font-weight-bold" style={{ color: 'var(--light-red)' }}>₨{total.toFixed(2)}</h5>
                  </div>
                  <Button onClick={handleProceed} className="w-100 mb-3" style={{ backgroundColor: 'var(--light-red)', borderColor: 'var(--light-red)' }}>
                    {hasProduce ? "Proceed to Checkout" : "Confirm Project Details"}
                  </Button>
                  <Link to="/shop" className="btn w-100 fw-bold rounded-pill" style={{ backgroundColor: 'var(--yellow)', color: 'var(--light-black)' }}>
                    {hasProduce ? "Keep Shopping" : "Add More Services"}
                  </Link>
                  <div className="mt-4 text-center pt-3 border-top">
                    <p className="smaller text-muted mb-0">
                      <i className="bi bi-shield-lock-fill me-2 text-success"></i>
                      SECURE ENTERPRISE CHECKOUT
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          ) : (
            <Row className="justify-content-center">
              <Col lg={6} className="text-center py-5 shadow-sm rounded bg-white" style={{ marginTop: '50px', borderTop: '4px solid var(--yellow)' }}>
                <div className="mb-4">
                  <i className="bi bi-cart-x text-muted" style={{ fontSize: '5rem', opacity: 0.3 }}></i>
                </div>
                <h3 className="mb-2" style={{ fontFamily: 'var(--oswald-font)', color: 'var(--light-black)' }}>YOUR CART IS AWAITING ASSETS</h3>
                <p className="text-muted mb-4 px-4">Initialize your farming pipeline by adding premium mushroom spores or industrial consultancy services.</p>
                <Link to="/shop" className="btn fw-bold rounded-pill shadow-sm" style={{ backgroundColor: 'var(--yellow)', color: 'var(--light-black)', padding: '12px 40px', letterSpacing: '1px' }}>
                  EXPLORE INVENTORY
                </Link>
              </Col>
            </Row>
          )}

          {/* AR Modal */}
          <Modal show={showAR} onHide={() => setShowAR(false)} centered size="lg">
            <Modal.Header closeButton>
              <Modal.Title>{activeModel.title} in 3D</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {activeModel.url && (
                <ARViewer src={activeModel.url} alt={`3D model of ${activeModel.title}`} />
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAR(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>

        </Container>
      </section>
    </Layout>
  );
};

export default Cart;
