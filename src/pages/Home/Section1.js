import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Burger from "../../assets/hero/hero-2.png";
import { Link } from "react-router-dom";

const Section1 = () => {
  return (
    <section className="hero_section">
      <Container>
        <Row>
          <Col lg={7} className="mb-5 mb-lg-0">
            <div className="position-relative">
              <img src={Burger} className="img-fluid" alt="Hero" />
              <div className="price_badge">
                <div className="badge_text">
                  <h4 className="h4_xs">Only</h4>
                  <h4 className="h3_lg">120rs</h4>
                </div>
              </div>
            </div>
          </Col>
          <Col lg={5}>
            <div className="hero_text text-center">
              <h2 className="text-white">Premium Quality</h2>
              <h2 className="text-white">Mushroom Cultivation Supplies</h2>
              <p className="text-white pt-2 pb-4">
                Everything you need to grow gourmet mushrooms at home.
              </p>
              <p className="text-white pb-4">
                From beginner grow kits to bulk sterilized spawn for commercial farms.
              </p>
              <Link to="/shop" className="btn order_now">
                Order Now
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Section1;
