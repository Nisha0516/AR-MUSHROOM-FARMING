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
                Our store provides top-tier cultivation supplies for everyone from hobbyists
                to industrial-scale growers. We offer premium exotic strains, high-yield substrate formulas, 
                and easy-to-use fruiting blocks, bridging the gap between professional mycologists and home growers.
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
