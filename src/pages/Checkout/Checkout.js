import React, { useContext, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layouts/Layout";
import { CartContext } from "../../context/CartContext";
import { useUser } from "../../context/UserContext";
import { userAPI, orderAPI } from "../../services/api";
import { FaCreditCard, FaFileContract } from "react-icons/fa";
import "../../styles/CheckoutStyle.css";

const Checkout = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const { user } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: user ? user.name.split(' ')[0] : "",
    lastName: user ? user.name.split(' ')[1] || "" : "",
    email: user ? user.email : "",
    address: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax + (subtotal > 0 ? 50 : 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Get User ID
      let currentUserId;
      if (user && user._id) {
        currentUserId = user._id;
      } else {
        const usersRes = await userAPI.getAll();
        if (!usersRes.success || usersRes.data.length === 0) {
          throw new Error("Unable to identify account. Database may not be seeded.");
        }
        const guestUser = usersRes.data.find(u => u.email === 'guest@ar-matrix.com') || usersRes.data[0];
        currentUserId = guestUser._id;
      }

      // 2. Format cart items
      const items = cartItems.map(item => {
        return {
          mushroom: item.id.split('-')[0], // strip out sizes
          quantity: item.quantity,
          price: item.price
        };
      });

      // 3. Initiate Razorpay Order from Backend
      const razorpayRes = await orderAPI.createRazorpayOrder({ amount: Math.round(total) });
      
      if (!razorpayRes.success) {
        throw new Error("Failed to initialize payment gateway.");
      }

      // If backend is in DEMO mode (no real keys), skip the real Razorpay popup
      if (razorpayRes.isMock) {
        const verifyRes = await orderAPI.verifyRazorpayPayment({
          razorpay_order_id: razorpayRes.orderId,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_signature'
        });

        if (verifyRes.success) {
          const orderPayload = {
            user: currentUserId,
            items: items,
            totalAmount: total,
            shippingAddress: {
              street: formData.address,
              city: "Default City",
              state: "Default State",
              zipCode: "00000",
              country: "Default Country"
            },
            status: "Processing",
            paymentStatus: "Completed"
          };

          const saveOrderRes = await orderAPI.create(orderPayload);
          if (saveOrderRes.success) {
            setSuccess(true);
            if (clearCart) clearCart();
            setTimeout(() => {
              navigate("/orders"); // send directly to orders page!
            }, 3000);
          } else {
            setError(saveOrderRes.message || "Failed to save order to database.");
          }
        }
        setLoading(false);
        return; // Exit here, do not launch window.Razorpay
      }

      // 4. Open Razorpay Checkout Window (Live Mode)
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_mock', // Fallback for demo
        amount: razorpayRes.amount,
        currency: razorpayRes.currency,
        name: "Mushroom Farm Supplies",
        description: "Secure Order Checkout",
        order_id: razorpayRes.orderId,
        handler: async function (response) {
          // 5. Payment successful, verify signature on backend
          try {
            const verifyRes = await orderAPI.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success) {
              // 6. Save final order to DB
              const orderPayload = {
                user: currentUserId,
                items: items,
                totalAmount: total,
                shippingAddress: {
                  street: formData.address,
                  city: "Default City",
                  state: "Default State",
                  zipCode: "00000",
                  country: "Default Country"
                },
                status: "Processing",
                paymentStatus: "Completed"
              };

              const saveOrderRes = await orderAPI.create(orderPayload);

              if (saveOrderRes.success) {
                setSuccess(true);
                if (clearCart) clearCart();
                setTimeout(() => {
                  navigate("/orders");
                }, 3000);
              } else {
                setError(saveOrderRes.message || "Failed to save order to database.");
              }
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch (verifyErr) {
            setError("Error verifying the payment.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: "9999999999"
        },
        theme: {
          color: "#051114" // Matches dark theme of application
        }
      };

      // Since Razorpay script is in index.html, `window.Razorpay` should be available
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setError(`Payment Failed: ${response.error.description}`);
          setLoading(false);
        });
        rzp.open();
      } else {
        throw new Error("Razorpay SDK failed to load. Please check your connection.");
      }

    } catch (err) {
      console.error("Checkout Error:", err);
      setError(err.message || "A network error occurred.");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="checkout-page py-5">
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="checkout_title">Order Confirmation</h2>
              <p className="text-white-50">
                Finalize your delivery details to secure your fresh harvest.
              </p>
            </Col>
          </Row>

          <Row>
            {/* Left Column: Customer Details */}
            <Col lg={8} className="mb-4">
              <div className="checkout_card" style={{ position: 'relative' }}>
                {success && (
                  <div className="position-absolute w-100 h-100 bg-white d-flex flex-column align-items-center justify-content-center" style={{ top: 0, left: 0, zIndex: 10, borderRadius: '12px' }}>
                    <i className="bi bi-check-circle-fill text-success mb-3" style={{ fontSize: '4rem' }}></i>
                    <h3>Order Confirmed!</h3>
                    <p className="text-muted">Redirecting you to the portal...</p>
                  </div>
                )}

                <h4><FaFileContract className="me-2" />Delivery Information</h4>
                {error && <div className="alert alert-danger">{error}</div>}
                <Form onSubmit={handleCheckout}>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>First Name</Form.Label>
                        <Form.Control type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" required />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" required />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" required />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Full Delivery Address</Form.Label>
                    <Form.Control as="textarea" rows={3} name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter your full street address, apartment, city, and pincode..." required />
                  </Form.Group>

                  <h4 className="mt-4">Payment Selection</h4>
                  <div className="payment_method mb-4">
                    <Form.Check
                      type="radio"
                      name="payment"
                      id="razorpay"
                      label={<span><FaCreditCard className="me-2" />Razorpay Secured Card & UPI</span>}
                      defaultChecked
                    />
                  </div>
                  <p className="small text-muted mb-4">You will be securely redirected to Razorpay to complete your transaction.</p>
                </Form>
              </div>
            </Col>

            {/* Right Column: Order Summary */}
            <Col lg={4}>
              <div className="summary_card shadow-sm">
                <h4 style={{ color: 'var(--light-black)', border: 'none' }}>Order Summary</h4>
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
                  <span>Delivery Fee</span>
                  <span>₨50.00</span>
                </div>
                <hr />
                <div className="summary_item mb-4">
                  <h5 className="mb-0">Estimated Total</h5>
                  <h5 className="mb-0 text-danger font-weight-bold">₨{total.toFixed(2)}</h5>
                </div>
                <Button
                  className="btn-finalize w-100 mb-3"
                  onClick={handleCheckout}
                  disabled={loading || cartItems.length === 0}
                >
                  {loading ? 'Processing via Razorpay...' : "Purchase Now"}
                </Button>
                <p className="small text-muted text-center">
                  By clicking, you agree to our Terms of Service.
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
