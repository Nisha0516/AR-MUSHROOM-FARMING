import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import PromotionImage from "../../assets/promotion/pro.png";

function Section4() {
  return (
    <>
      <section className="promotion_section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="text-center mb-5 mb-lg-0">
              <img src={PromotionImage} className="img-fluid" alt="Promotion" />
            </Col>
            <Col lg={6} className="px-5">
              <h2>Bridging Technology and Agriculture</h2>
              <p>
                Our AR-Based Mushroom Farming Enterprise is a professional consultancy designed to supply
                cutting-edge visualizations and layouts for mushroom facilities. We work directly with farms to ensure
                optimized spacing, temperature management, and workflow efficiency. The platform makes planning easy for growers,
                offering scalable and profitable data integrations with AR mapping.
              </p>
              <ul>
                <li>
                  <p>
                    Customer Support & Inquiry System
                    Dedicated support for quotations, bulk inquiries, and partnerships.
                  </p>
                </li>
                <li>
                  <p>best price</p>
                </li>
                <li>
                  <p>
                    Reliable & On-Time Delivery
                    Well-managed logistics to ensure timely delivery.
                  </p>
                </li>
              </ul>
            </Col>
          </Row>
        </Container>
      </section>

      {/* BG Parallax Scroll */}
      <section className="bg_parallax_scroll"></section>
    </>
  );
}

export default Section4;
