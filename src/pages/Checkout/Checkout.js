import React, { useContext } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import Layout from "../../components/Layouts/Layout";
import { CartContext } from "../../context/CartContext";
import { FaCreditCard, FaPaypal, FaFileContract } from "react-icons/fa";
import "../../styles/CheckoutStyle.css";

const Checkout = () => {
  const { cartItems } = useContext(CartContext);
  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax + (subtotal > 0 ? 50 : 0);

  const hasProduce = cartItems.some(item => item.id.includes('p00'));

  return (
    <Layout>
      <section className="checkout-page py-5">
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="checkout_title">{hasProduce ? "Order Confirmation" : "Project Confirmation"}</h2>
              <p className="text-white-50">
                {hasProduce
                  ? "Finalize your delivery details to secure your fresh harvest."
                  : "Finalize your consultancy details and enterprise assets."}
              </p>
            </Col>
          </Row>

          <Row>
            {/* Left Column: Customer Details */}
            <Col lg={8} className="mb-4">
              <div className="checkout_card">
                <h4><FaFileContract className="me-2" />{hasProduce ? "Delivery Information" : "Customer Details"}</h4>
                <Form>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>First Name</Form.Label>
                        <Form.Control type="text" placeholder="John" required />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control type="text" placeholder="Doe" required />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control type="email" placeholder="john@example.com" required />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Full Delivery Address</Form.Label>
                    <Form.Control as="textarea" rows={3} placeholder="Enter your full street address, apartment, city, and pincode..." required />
                  </Form.Group>

                  <h4 className="mt-4">Payment Selection</h4>
                  <div className="payment_method mb-4">
                    <Form.Check
                      type="radio"
                      name="payment"
                      id="card"
                      label={<span><FaCreditCard className="me-2" />Credit/Debit Card</span>}
                      defaultChecked
                    />
                    <Form.Check
                      type="radio"
                      name="payment"
                      id="paypal"
                      label={<span><FaPaypal className="me-2" />PayPal</span>}
                    />
                  </div>

                  <div className="payment_details_box p-4 rounded border">
                    <h5 className="mb-3" style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--light-black)' }}>Secure Payment Processing</h5>
                    <Form.Group className="mb-3">
                      <Form.Label>Name on Card</Form.Label>
                      <Form.Control type="text" placeholder="John Doe" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Card Number</Form.Label>
                      <Form.Control type="text" placeholder="0000 0000 0000 0000" />
                    </Form.Group>
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>Expiry Date</Form.Label>
                          <Form.Control type="text" placeholder="MM / YY" />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>CVV / CVC</Form.Label>
                          <Form.Control type="password" placeholder="***" />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                </Form>
              </div>
            </Col>

            {/* Right Column: Order Summary */}
            <Col lg={4}>
              <div className="summary_card shadow-sm">
                <h4 style={{ color: 'var(--light-black)', border: 'none' }}>{hasProduce ? "Order Summary" : "Project Summary"}</h4>
                <hr />
                {cartItems.map((item) => (
                  <div key={item.id} className="summary_item">
                    <span>{item.title} (x{item.quantity})</span>
                    <span>₨{item.total}</span>
                  </div>
                ))}
                <hr />
                <div className="summary_item">
                  <span>Subtotal</span>
                  <span>₨{subtotal}</span>
                </div>
                <div className="summary_item">
                  <span>Vat & Taxes</span>
                  <span>₨{tax.toFixed(2)}</span>
                </div>
                <div className="summary_item">
                  <span>{hasProduce ? "Delivery Fee" : "Setup Fee"}</span>
                  <span>₨50.00</span>
                </div>
                <hr />
                <div className="summary_item mb-4">
                  <h5 className="mb-0">Estimated Total</h5>
                  <h5 className="mb-0 text-danger font-weight-bold">₨{total.toFixed(2)}</h5>
                </div>
                <Button className="btn-finalize w-100 mb-3">
                  {hasProduce ? "Purchase Now" : "Initiate Project Launch"}
                </Button>
                <p className="small text-muted text-center">
                  By clicking, you agree to our {hasProduce ? "Standard Sales" : "Consultancy"} Terms of Service.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </Layout>
  );
};

export default Checkout;
