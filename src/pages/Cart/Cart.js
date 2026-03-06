import React, { useContext, useState } from "react";
import { Container, Row, Col, Table, Button, Modal } from "react-bootstrap";
import Layout from "../../components/Layouts/Layout";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import "../../styles/CartStyle.css";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useContext(CartContext);

  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const navigate = useNavigate();
  const hasProduce = cartItems.some(item => item.id.includes('p00'));

  const handleProceed = () => {
    navigate("/checkout");
  };

  const handleQtyChange = (id, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty >= 1) {
      updateQuantity(id, newQty);
    }
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
            <Row className="g-4">
              <Col lg={8}>
                <div className="table-responsive">
                  <Table className="cart_table align-middle">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th className="text-center">Quantity</th>
                        <th className="text-end">Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              {item.image ? (
                                <img src={item.image} alt={item.title} className="cart_item_img" />
                              ) : (
                                <div className="cart_item_img d-flex align-items-center justify-content-center bg-light text-muted">
                                  <i className="bi bi-box-seam fs-3"></i>
                                </div>
                              )}
                              <div>
                                <h5 className="cart_item_title">{item.title.split(' (')[0]}</h5>
                                {item.measure && (
                                  <span className="cart_item_measure bg-light px-2 py-1 rounded">
                                    <i className="bi bi-tag-fill me-1"></i>
                                    {item.measure}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="fw-medium text-muted">₨{item.price}</td>
                          <td className="text-center">
                            <div className="cart_qty_wrapper">
                              <button className="cart_qty_btn" onClick={() => handleQtyChange(item.id, item.quantity, -1)}>−</button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => {
                                  let val = parseInt(e.target.value);
                                  if (!isNaN(val) && val > 0) updateQuantity(item.id, val);
                                }}
                                className="cart_qty_input"
                              />
                              <button className="cart_qty_btn" onClick={() => handleQtyChange(item.id, item.quantity, 1)}>+</button>
                            </div>
                          </td>
                          <td className="text-end cart_total_price">₨{item.total}</td>
                          <td className="text-end">
                            <div className="d-flex flex-column align-items-end gap-2">
                              <Button
                                variant="link"
                                className="text-danger p-0 border-0 shadow-none text-decoration-none"
                                onClick={() => removeFromCart(item.id)}
                                title="Remove Item"
                              >
                                <i className="bi bi-trash3 fs-5"></i>
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
                <div className="cart_summary p-4">
                  <h4 className="summary_title mb-4">{hasProduce ? "Order Summary" : "Project Summary"}</h4>
                  
                  <div className="summary_item d-flex justify-content-between mb-3">
                    <span>Subtotal</span>
                    <span className="fw-bold text-dark">₨{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="summary_item d-flex justify-content-between mb-3">
                    <span>{hasProduce ? "Delivery Fee" : "Handling/Setup"}</span>
                    <span className="fw-bold text-dark">{shipping === 0 ? (hasProduce ? <span className="text-success border border-success rounded px-2 py-1 small">FREE</span> : "WAIVED") : `₨${shipping.toFixed(2)}`}</span>
                  </div>
                  
                  <div className="summary_item d-flex justify-content-between mb-3">
                    <span>Tax (10%)</span>
                    <span className="fw-bold text-dark">₨{tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="summary_total d-flex justify-content-between align-items-center">
                    <span className="total_label">Total</span>
                    <span className="total_amount">₨{total.toFixed(2)}</span>
                  </div>
                  
                  <Button onClick={handleProceed} className="btn-checkout w-100 mb-3 d-flex align-items-center justify-content-center">
                    {hasProduce ? "Proceed to Checkout" : "Confirm Project"} <i className="bi bi-arrow-right ms-2"></i>
                  </Button>
                  
                  <Link to="/shop" className="btn btn-continue w-100 text-center d-block text-decoration-none">
                    <i className="bi bi-arrow-left me-2"></i> {hasProduce ? "Continue Shopping" : "Add More Services"}
                  </Link>

                  <div className="mt-4 text-center">
                    <p className="small text-muted mb-0 d-flex align-items-center justify-content-center gap-2">
                      <i className="bi bi-shield-lock-fill text-success fs-5"></i>
                      <span>Guaranteed Safe & Secure Checkout</span>
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          ) : (
            <Row className="justify-content-center">
              <Col lg={6} className="empty_cart_card bg-white rounded-4 shadow-sm text-center p-5 mt-4">
                <div className="mb-4">
                  <i className="bi bi-cart-x" style={{ fontSize: '5rem', color: '#e0e0e0' }}></i>
                </div>
                <h3 className="mb-3" style={{ fontFamily: 'var(--oswald-font)', color: 'var(--light-black)' }}>YOUR CART IS AWAITING ASSETS</h3>
                <p className="text-muted mb-4 px-lg-4 lh-lg">
                  Initialize your farming pipeline by adding premium mushroom spores or cultivation supplies.
                </p>
                <Link to="/shop" className="btn shadow-sm text-uppercase fw-bold px-5 py-3 rounded-pill" style={{ backgroundColor: 'var(--yellow)', color: 'var(--light-black)', letterSpacing: '1px' }}>
                  Explore Inventory
                </Link>
              </Col>
            </Row>
          )}

        </Container>
      </section>
    </Layout>
  );
};

export default Cart;
