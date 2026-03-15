import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const guarantees = [
  { icon: "bi-shield-check", label: "Freshness Guaranteed" },
  { icon: "bi-arrow-counterclockwise", label: "Easy Returns" },
  { icon: "bi-box-seam", label: "Careful Packaging" },
  { icon: "bi-chat-dots", label: "24/7 Support" },
];

function Section7() {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
        padding: "70px 0",
      }}
    >
      <Container>
        <Row className="align-items-center gy-5">
          {/* Left: promise badges */}
          <Col lg={6}>
            <span
              style={{
                color: "#a5b4fc",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "2px",
                fontSize: "0.75rem",
              }}
            >
              Our Promise
            </span>
            <h2
              style={{
                fontWeight: 800,
                color: "#fff",
                fontSize: "2rem",
                margin: "12px 0 24px",
                lineHeight: 1.3,
              }}
            >
              Every Order, Every Time —<br />You're in Good Hands
            </h2>
            <Row className="g-3">
              {guarantees.map((g) => (
                <Col xs={6} key={g.label}>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "12px",
                      padding: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <i
                      className={`bi ${g.icon}`}
                      style={{ color: "#a5b4fc", fontSize: "1.4rem", flexShrink: 0 }}
                    ></i>
                    <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "0.9rem" }}>
                      {g.label}
                    </span>
                  </div>
                </Col>
              ))}
            </Row>
          </Col>

          {/* Right: CTA */}
          <Col lg={6} className="text-center text-lg-start ps-lg-5">
            <h3 style={{ color: "#fff", fontWeight: 700, marginBottom: "16px" }}>
              Questions? We're Here.
            </h3>
            <p style={{ color: "#94a3b8", marginBottom: "28px", lineHeight: 1.7 }}>
              Whether you need help choosing the right strain, placing a bulk order, or tracking
              a delivery — our team responds within the hour.
            </p>
            <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
              <Link
                to="/contact"
                style={{
                  background: "#fff",
                  color: "#1a1a2e",
                  padding: "13px 32px",
                  borderRadius: "50px",
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: "0.95rem",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Contact Us
              </Link>
              <Link
                to="/consultancy"
                style={{
                  background: "transparent",
                  color: "#a5b4fc",
                  padding: "13px 32px",
                  borderRadius: "50px",
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: "0.95rem",
                  border: "2px solid rgba(165,180,252,0.4)",
                  transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#a5b4fc";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(165,180,252,0.4)";
                  e.currentTarget.style.color = "#a5b4fc";
                }}
              >
                Get a Consultation
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default Section7;
