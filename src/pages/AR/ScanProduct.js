import React from "react";
import { Container, Row, Col, Image, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function ScanProduct() {
  return (
    <div className="scan-grow-page py-5">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6} className="text-center">
            <div className="p-4 bg-white rounded shadow-sm">
              <h3 className="mb-3">Product Scanner (QR)</h3>
              <p className="text-muted small mb-3">Point another device's camera at this QR to open the shop or product scanner.</p>
              <Image src="/qr/QR.png" alt="Common QR" fluid style={{ maxWidth: 420 }} />
              <div className="d-flex justify-content-center gap-2 mt-3">
                <Button as={Link} to="/product-markers" variant="outline-secondary">Product QRs</Button>
                <Button as={Link} to="/shop" variant="dark">Open Shop</Button>
              </div>
              <p className="small text-muted mt-3">Camera scanning has been removed from this page — only the common QR is shown.</p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

