import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import Layout from "../../components/Layouts/Layout";
import { FaPhoneAlt, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { inquiryAPI } from "../../services/api";
import "../../styles/ContactStyle.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { id, value, name } = e.target;
    // Fallback support for id attribute mappings if a name isn't directly assigned
    let mappedName = name;
    if (!name) {
      if (id === 'formName') mappedName = 'name';
      else if (id === 'formEmail') mappedName = 'email';
      else if (id === 'formPhone') mappedName = 'phone';
      else if (id === 'formService') mappedName = 'service';
      else if (id === 'formMessage') mappedName = 'message';
    }

    setFormData({ ...formData, [mappedName]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await inquiryAPI.create(formData);
      if (response.success) {
        setSuccess("Thank you for reaching out! A representative will contact you shortly.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          service: "",
          message: ""
        });
      } else {
        setError(response.message || "Failed to submit inquiry. Please try again.");
      }
    } catch (err) {
      console.error("Inquiry error:", err);
      setError("Network error. Please make sure the server is available.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Contact Hero Section */}
      <section className="contact_hero_section py-5 bg-dark text-white text-center">
        <Container>
          <Row>
            <Col lg={12}>
              <h1 className="display-4 font-weight-bold mb-3">Get in Touch</h1>
              <p className="lead">
                Elevate your mushroom enterprise with our AR visualization and smart farming pipelines.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Main Contact Content */}
      <section className="contact_content py-5">
        <Container>
          <Row className="mb-5">
            {/* Contact Info Cards */}
            <Col lg={4} className="mb-4">
              <Row>
                <Col md={12} className="mb-4">
                  <Card className="border-0 shadow-sm text-center h-100 py-4">
                    <Card.Body>
                      <FaMapMarkerAlt size={40} className="mb-3" style={{ color: 'var(--light-red)' }} />
                      <h5 className="font-weight-bold">Farm Headquarters</h5>
                      <p className="text-muted mb-0">123 Agriculture Tech Park<br />Innovation District, NY 10001</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={12} className="mb-4">
                  <Card className="border-0 shadow-sm text-center h-100 py-4">
                    <Card.Body>
                      <FaPhoneAlt size={40} className="mb-3" style={{ color: 'var(--yellow)' }} />
                      <h5 className="font-weight-bold">Phone Inquiry</h5>
                      <p className="text-muted mb-0">+1 (555) 123-4567<br />Mon-Fri 9am - 6pm EST</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={12}>
                  <Card className="border-0 shadow-sm text-center h-100 py-4">
                    <Card.Body>
                      <FaClock size={40} className="mb-3" style={{ color: 'var(--bg-coffee)' }} />
                      <h5 className="font-weight-bold">Customer Service</h5>
                      <p className="text-muted mb-0">support@ar-mushroom.com<br />Order & Product Assistance</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>

            {/* Contact Form */}
            <Col lg={8}>
              <Card className="border-0 shadow h-100 p-4">
                <Card.Body>
                  <h3 className="mb-4">Request a Consultation</h3>
                  <p className="text-muted mb-4">
                    Fill out the form below to receive assistance with your order, product questions, or bulk supply.
                  </p>

                  {success && <Alert variant="success">{success}</Alert>}
                  {error && <Alert variant="danger">{error}</Alert>}

                  <Form className="contact-form" onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="formName">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control type="text" placeholder="Enter your name" value={formData.name} onChange={handleInputChange} required />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="formEmail">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control type="email" placeholder="name@company.com" value={formData.email} onChange={handleInputChange} required />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="formPhone">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control type="tel" placeholder="(123) 456-7890" value={formData.phone} onChange={handleInputChange} />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="formService">
                          <Form.Label>Inquiry Type</Form.Label>
                          <Form.Select value={formData.service} onChange={handleInputChange} required>
                            <option value="">Select an inquiry type...</option>
                            <option value="order-support">Order Support</option>
                            <option value="product-question">Product Questions</option>
                            <option value="bulk-order">Bulk Supplies & Spores</option>
                            <option value="other">Other</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-4" controlId="formMessage">
                      <Form.Label>Your Message</Form.Label>
                      <Form.Control as="textarea" rows={6} placeholder="How can we help optimize your yields?" value={formData.message} onChange={handleInputChange} required />
                    </Form.Group>

                    <Button variant="primary" type="submit" size="lg" className="w-100 submit-btn" disabled={loading}>
                      {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Send Message"}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </Layout>
  );
};

export default Contact;
