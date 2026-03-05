import React from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import Layout from "../../components/Layouts/Layout";
import { FaPhoneAlt, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import "../../styles/ContactStyle.css";

const Contact = () => {
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
                      <h5 className="font-weight-bold">AR & 3D Support</h5>
                      <p className="text-muted mb-0">support@ar-mushroom.com<br />24/7 technical assistance</p>
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
                    Fill out the form below to receive a custom quote for 3D modeling, layout mapping, or bulk supply.
                  </p>
                  <Form className="contact-form">
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="formName">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control type="text" placeholder="Enter your name" required />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="formEmail">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control type="email" placeholder="name@company.com" required />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="formPhone">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control type="tel" placeholder="(123) 456-7890" />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="formService">
                          <Form.Label>Inquiry Type</Form.Label>
                          <Form.Select required>
                            <option value="">Select a service...</option>
                            <option value="ar-models">3D/AR Model Commission</option>
                            <option value="consulting">Farm Layout Consulting</option>
                            <option value="bulk-order">Bulk Mushroom Order</option>
                            <option value="other">Other</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-4" controlId="formMessage">
                      <Form.Label>Your Message</Form.Label>
                      <Form.Control as="textarea" rows={6} placeholder="How can we help optimize your yields?" required />
                    </Form.Group>

                    <Button variant="primary" type="submit" size="lg" className="w-100 submit-btn">
                      Send Message
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
