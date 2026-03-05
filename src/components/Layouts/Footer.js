import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

function Footer() {
  // Scroll State
  const [isVisible, setIsVisible] = useState(false);
  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const listenToScroll = () => {
    let heightToHidden = 250;
    const windowScroll =
      document.body.scrollTop || document.documentElement.scrollTop;

    windowScroll > heightToHidden ? setIsVisible(true) : setIsVisible(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", listenToScroll);
  });
  return (
    <>
      <footer>
        <Container>
          <Row>
            <Col sm={6} lg={4} className="mb-4 mb-lg-0 text-center">
              <div>
                <h5>Laboratory HQ</h5>
                <p>123 Agriculture Tech Park</p>
                <p>Innovation District, NY</p>
                <p>Enterprise Wing A</p>
              </div>
            </Col>
            <Col sm={6} lg={4} className="mb-4 mb-lg-0 text-center">
              <div>
                <h5>Support Hours</h5>
                <p>Mon-Fri: 9:00AM - 6:00PM EST</p>
                <p>Saturday: 10:00AM - 2:00PM</p>
                <p>24/7 AR Technical Support</p>
              </div>
            </Col>

            <Col sm={12} lg={4} className="mb-4 mb-lg-0 text-center">
              <div>
                <h5>Follow Our Vision</h5>
                <p>Innovating Ag-Tech with Immersive 3D</p>
                <ul className="list-unstyled text-center d-flex justify-content-center mt-2">
                  <li className="mx-2">
                    <Link to="/">
                      <i class="bi bi-facebook"></i>
                    </Link>
                  </li>
                  <li className="mx-2">
                    <Link to="/">
                      <i class="bi bi-linkedin"></i>
                    </Link>
                  </li>
                  <li className="mx-2">
                    <Link to="/">
                      <i class="bi bi-instagram"></i>
                    </Link>
                  </li>
                  <li className="mx-2">
                    <Link to="/">
                      <i class="bi bi-youtube"></i>
                    </Link>
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
          <Row className="copy_right">
            <Col>
              <div>
                <ul className="list-unstyled text-center mb-0">
                  <li>
                    <Link to="/">
                      © 2026 <span>mohanaprasad</span>. All Rights Reserved
                    </Link>
                  </li>
                  <li>
                    <Link to="/">About Us</Link>
                  </li>
                  <li>
                    <Link to="/">Terms Of Use</Link>
                  </li>
                  <li>
                    <Link to="/">Privacy Policy</Link>
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>

      {/* Sroll To Top */}
      {isVisible && (
        <div className="scroll_top" onClick={scrollTop}>
          <i class="bi bi-arrow-up"></i>
        </div>
      )}
    </>
  );
}

export default Footer;
