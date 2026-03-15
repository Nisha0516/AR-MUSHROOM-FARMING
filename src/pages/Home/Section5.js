import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const features = [
  {
    icon: "bi-patch-check-fill",
    title: "100% Organic & Fresh",
    desc: "All our mushrooms are grown without pesticides, harvested to order, and dispatched within 24 hours.",
  },
  {
    icon: "bi-truck",
    title: "Fast & Reliable Delivery",
    desc: "Express shipping with temperature-controlled packaging to keep your order fresh from farm to doorstep.",
  },
  {
    icon: "bi-headset",
    title: "Expert Consultation",
    desc: "Our mycology specialists are available to guide you — from growing substrate selection to culinary techniques.",
  },
  {
    icon: "bi-shield-lock-fill",
    title: "Secure & Easy Checkout",
    desc: "Our Razorpay-integrated checkout accepts UPI, cards, net banking and wallets — fully encrypted and safe.",
  },
];

function Section5() {
  return (
    <section
      style={{
        backgroundColor: "#f8f9fa",
        padding: "80px 0",
        borderTop: "1px solid #e9ecef",
      }}
    >
      <Container>
        <Row className="text-center mb-5">
          <Col>
            <span
              style={{
                color: "#5c6bc0",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "2px",
                fontSize: "0.8rem",
              }}
            >
              Why Choose Us
            </span>
            <h2
              style={{
                fontWeight: 800,
                color: "#1a1a2e",
                fontSize: "2rem",
                marginTop: "8px",
              }}
            >
              The Mushroom Farm Difference
            </h2>
          </Col>
        </Row>
        <Row className="g-4">
          {features.map((f) => (
            <Col key={f.title} md={6} lg={3}>
              <div
                className="h-100 p-4 rounded-4 text-center"
                style={{
                  background: "#fff",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)";
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    background: "linear-gradient(135deg, #1a1a2e, #5c6bc0)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <i
                    className={`bi ${f.icon}`}
                    style={{ color: "#fff", fontSize: "1.4rem" }}
                  ></i>
                </div>
                <h5 style={{ fontWeight: 700, color: "#1a1a2e", marginBottom: "10px" }}>
                  {f.title}
                </h5>
                <p style={{ color: "#6c757d", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            </Col>
          ))}
        </Row>
        <Row className="mt-5 text-center">
          <Col>
            <Link
              to="/shop"
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #1a1a2e, #5c6bc0)",
                color: "#fff",
                padding: "14px 40px",
                borderRadius: "50px",
                fontWeight: 700,
                textDecoration: "none",
                letterSpacing: "0.5px",
                boxShadow: "0 4px 16px rgba(92,107,192,0.3)",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Shop the Harvest →
            </Link>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default Section5;
