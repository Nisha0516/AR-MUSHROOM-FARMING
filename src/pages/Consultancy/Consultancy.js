import React from "react";
import { Container, Row, Col, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import Layout from "../../components/Layouts/Layout";
import YieldCalculator from "../../components/Consultancy/YieldCalculator";
import "../../styles/ConsultancyStyle.css";

const Consultancy = () => {
    return (
        <Layout>
            <div className="consultancy-page">
                {/* Animated Background Elements */}
                <div className="bg-orb orb-1"></div>
                <div className="bg-orb orb-2"></div>

                {/* Enterprise Hero Section */}
                <section className="enterprise-hero pt-5 mt-5">
                    <Container>
                        <Row className="justify-content-center">
                            <Col lg={10} className="text-center">
                                <Badge bg="danger" className="mb-3 p-2 px-3 rounded-pill text-uppercase shadow-sm" style={{ letterSpacing: '2px' }}>Enterprise Solutions</Badge>
                                <h1 className="hero-title text-white">
                                    Elevate Your Farm with <br />
                                    <span className="highlight">Smart Mycological Architecture</span>
                                </h1>
                                <p className="hero-subtitle">
                                    We blend augmented reality planning with decades of agricultural expertise to maximize your yield, optimize your space, and scale your commercial mushroom production.
                                </p>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Tiered Packages Section */}
                <section className="packages-section py-5">
                    <Container>
                        <Row className="text-center mb-5">
                            <Col lg={12}>
                                <h2 className="text-white mb-3" style={{ fontWeight: '800' }}>Enterprise Products</h2>
                                <p className="text-white-50">Tools and genetics to scale your production.</p>
                            </Col>
                        </Row>

                        <Row className="align-items-center justify-content-center">
                            {/* Hobbyist Grow Kit */}
                            <Col lg={4} md={6} className="mb-4">
                                <div className="glass-card package-card">
                                    <div className="package-header">
                                        <i className="bi bi-box2-heart package-icon text-white-50"></i>
                                        <h3 className="package-title text-white">Hobbyist Grow Kit</h3>
                                        <div className="package-price text-white-50">₨1,500<span style={{ fontSize: '1rem', fontWeight: '400' }}>/kit</span></div>
                                    </div>
                                    <ul className="package-features">
                                        <li><i className="bi bi-check2-circle"></i> Pre-colonized substrate</li>
                                        <li><i className="bi bi-check2-circle"></i> Beginner's growing guide</li>
                                        <li><i className="bi bi-check2-circle"></i> Spray bottle & humidity tent</li>
                                        <li className="text-white-50"><i className="bi bi-dash text-white-50"></i> Yields up to 2kg</li>
                                    </ul>
                                    <Link to="/shop" className="btn btn-outline-light w-100 py-3 rounded-pill fw-bold mt-auto">Order Kit</Link>
                                </div>
                            </Col>

                            {/* Commercial Spore Bank (Recommended) */}
                            <Col lg={4} md={6} className="mb-4 z-index-2">
                                <div className="glass-card package-card recommended shadow-lg">
                                    <div className="recommended-badge">Most Popular</div>
                                    <div className="package-header">
                                        <i className="bi bi-diagram-3 package-icon text-warning"></i>
                                        <h3 className="package-title text-white">Spore Bank Access</h3>
                                        <div className="package-price text-warning">₨5,000<span style={{ fontSize: '1rem', fontWeight: '400' }}>/year</span></div>
                                    </div>
                                    <ul className="package-features">
                                        <li><i className="bi bi-check2-circle text-warning"></i> Exclusive high-yield strains</li>
                                        <li><i className="bi bi-check2-circle text-warning"></i> Liquid culture syringes</li>
                                        <li><i className="bi bi-check2-circle text-warning"></i> Commercial licensing rights</li>
                                        <li><i className="bi bi-check2-circle text-warning"></i> Genetic consultation</li>
                                    </ul>
                                    <Link to="/shop" className="btn btn-warning w-100 py-3 rounded-pill fw-bold text-dark mt-auto">Get Access</Link>
                                </div>
                            </Col>

                            {/* AR Farm Management Software */}
                            <Col lg={4} md={6} className="mb-4">
                                <div className="glass-card package-card">
                                    <div className="package-header">
                                        <i className="bi bi-laptop package-icon text-white-50"></i>
                                        <h3 className="package-title text-white">AR Farm Software</h3>
                                        <div className="package-price text-white-50">₨15k<span style={{ fontSize: '1rem', fontWeight: '400' }}>/mo</span></div>
                                    </div>
                                    <ul className="package-features">
                                        <li><i className="bi bi-check2-circle"></i> Live AR environmental tracking</li>
                                        <li><i className="bi bi-check2-circle"></i> Automated climate robotics api</li>
                                        <li><i className="bi bi-check2-circle"></i> Full yield analytics dashboard</li>
                                        <li><i className="bi bi-check2-circle"></i> 24/7 technical support</li>
                                    </ul>
                                    <Link to="/contact" className="btn btn-outline-light w-100 py-3 rounded-pill fw-bold mt-auto">Request Demo</Link>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Calculator Section */}
                <section className="calculator-section py-5">
                    <Container>
                        <Row className="justify-content-center">
                            <Col lg={8}>
                                <YieldCalculator />
                            </Col>
                        </Row>
                    </Container>
                </section>
            </div>
        </Layout>
    );
};

export default Consultancy;
