import React from "react";
import Layout from "../../components/Layouts/Layout";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { FaLeaf, FaTruck, FaAward, FaUsers, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";
import "../../styles/HomeStyle.css";

const About = () => {
  return (
    <Layout>
      {/* About Hero Section */}
      <section className="about_section">
        <Container>
          <Row>
            <Col lg={12} className="text-center">
              <Badge bg="danger" className="mb-3 p-2 px-3 rounded-pill text-uppercase shadow-sm" style={{ letterSpacing: '2px' }}>Enterprise AR</Badge>
              <h1 className="text-white mb-4 about_hero_title">Redefining Mycological Architecture</h1>
              <p className="text-white lead mb-0">Merging Augmented Reality with Sustainable Agriculture</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* About Content Section */}
      <section className="about_content py-5">
        <Container>
          <Row className="mb-5">
            <Col lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <FaLeaf className="text-success" size={48} />
                  </div>
                  <h4 className="mb-3">Our Digital Roots</h4>
                  <p className="text-muted">
                    Founded in 2015, we began with a vision to revolutionize mushroom cultivation. Today, we've
                    evolved into a tech-first enterprise, using 3D spatial mapping and AR to help farmers
                    visualize their yields and optimize laboratory layouts before the first brick is laid.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <FaAward className="text-primary" size={48} />
                  </div>
                  <h4 className="mb-3">Our Tech Mission</h4>
                  <p className="text-muted">
                    We provide high-precision AR tools and elite genetics to ensure your farm's success.
                    Our mission is to bridge the gap between complex mycological data and intuitive
                    visual management, making commercial mushroom production accessible to everyone.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <FaTruck className="text-info" size={48} />
                  </div>
                  <h4 className="mb-3">Our Vision</h4>
                  <p className="text-muted">
                    To become the leading global provider of farm-fresh mushrooms, setting industry standards
                    for quality, sustainability, and customer satisfaction. We believe in revolutionizing the
                    mushroom supply chain while maintaining the personal touch that makes us special.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-5">
            <Col lg={12} className="text-center mb-4">
              <h3 className="mb-2">Meet Our Expert Team</h3>
              <p className="text-muted">The passionate professionals behind your premium mushrooms</p>
            </Col>
            <Col lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm team-card">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <div className="team-avatar bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                      <FaUsers size={32} />
                    </div>
                  </div>
                  <h5 className="mb-1">Founder & CEO</h5>
                  <p className="text-muted small mb-2">Leadership & Strategy</p>
                  <p className="text-muted mb-0">20+ years in sustainable agriculture and farm management innovation</p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm team-card">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <div className="team-avatar bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                      <FaCheckCircle size={32} />
                    </div>
                  </div>
                  <h5 className="mb-1">Quality Manager</h5>
                  <p className="text-muted small mb-2">Quality Assurance</p>
                  <p className="text-muted mb-0">Expert in food safety protocols and premium quality control systems</p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm team-card">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <div className="team-avatar bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                      <FaTruck size={32} />
                    </div>
                  </div>
                  <h5 className="mb-1">AR Design Lead</h5>
                  <p className="text-muted small mb-2">Spatial Visualization</p>
                  <p className="text-muted mb-0">Specialist in immersive interfaces and digital twin farm mapping.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-5">
            <Col lg={12} className="text-center mb-4">
              <h3 className="mb-2">Certifications & Quality Standards</h3>
              <p className="text-muted">Our commitment to excellence is backed by industry-leading certifications</p>
            </Col>
            <Col lg={8} className="mx-auto">
              <Row>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center p-3 bg-light rounded">
                    <FaCheckCircle className="text-success me-3" size={24} />
                    <div>
                      <h6 className="mb-1">ISO 22000 Certified</h6>
                      <small className="text-muted">Food Safety Management System</small>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center p-3 bg-light rounded">
                    <FaLeaf className="text-success me-3" size={24} />
                    <div>
                      <h6 className="mb-1">Organic Certification</h6>
                      <small className="text-muted">100% Organic Farming Practices</small>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center p-3 bg-light rounded">
                    <FaAward className="text-primary me-3" size={24} />
                    <div>
                      <h6 className="mb-1">HACCP Certified</h6>
                      <small className="text-muted">Hazard Analysis Critical Control Points</small>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center p-3 bg-light rounded">
                    <FaCheckCircle className="text-info me-3" size={24} />
                    <div>
                      <h6 className="mb-1">Health Inspected</h6>
                      <small className="text-muted">Regular Compliance Verification</small>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>

          <Row className="mb-5">
            <Col lg={12} className="text-center mb-4">
              <h3 className="mb-2">Get In Touch</h3>
              <p className="text-muted">We're here to help with your mushroom needs</p>
            </Col>
            <Col lg={8} className="mx-auto">
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <Row>
                    <Col md={4} className="text-center mb-3 mb-md-0">
                      <div className="contact-item">
                        <FaPhone className="text-primary mb-2" size={24} />
                        <h6 className="mb-1">Phone</h6>
                        <p className="text-muted mb-0">+92 300 1234567</p>
                      </div>
                    </Col>
                    <Col md={4} className="text-center mb-3 mb-md-0">
                      <div className="contact-item">
                        <FaEnvelope className="text-success mb-2" size={24} />
                        <h6 className="mb-1">Email</h6>
                        <p className="text-muted mb-0">info@tastymushrooms.com</p>
                      </div>
                    </Col>
                    <Col md={4} className="text-center">
                      <div className="contact-item">
                        <FaMapMarkerAlt className="text-info mb-2" size={24} />
                        <h6 className="mb-1">Address</h6>
                        <p className="text-muted mb-0">Farm Road, Agriculture District</p>
                      </div>
                    </Col>
                  </Row>
                  <div className="text-center mt-4">
                    <p className="text-muted mb-0">Available Monday-Friday: 8AM-6PM | Saturday: 9AM-4PM</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="text-center">
            <Col lg={12}>
              <Link to="/" className="btn btn-primary btn-lg px-5 py-3">
                Back to Home
              </Link>
            </Col>
          </Row>
        </Container>
      </section>
    </Layout>
  );
};

export default About;
