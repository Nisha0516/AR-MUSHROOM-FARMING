import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import Cards from "../../components/Layouts/Cards";
import { mushroomAPI } from "../../services/api";

// Rating Logical Data
const renderRatingIcons = (rating) => {
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (rating > 0.5) {
      stars.push(<i key={i} className="bi bi-star-fill"></i>);
      rating--;
    } else if (rating > 0 && rating < 1) {
      stars.push(<i key={"half"} className="bi bi-star-half"></i>);
      rating--;
    } else {
      stars.push(<i key={`empty${i}`} className="bi bi-star"></i>);
    }
  }
  return stars;
};

function Section3() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await mushroomAPI.getAll();
        if (response.success) {
          // Display only the first 4 items on the home page showcase
          setProducts(response.data.slice(0, 4));
        } else {
          setError("Failed to load showcase from server.");
        }
      } catch (err) {
        setError("Network error connecting to the database.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="menu_section">
      <Container>
        <Row>
          <Col lg={{ span: 8, offset: 2 }} className="text-center mb-5">
            <h2>PREMIUM GROWING SUPPLIES</h2>
            <p className="para">
              High-yield spawn, sterilized substrates, and complete grow kits.
            </p>
          </Col>
        </Row>

        {loading ? (
          <Row className="justify-content-center my-5">
            <Spinner animation="border" style={{ color: "var(--yellow)" }} />
          </Row>
        ) : error ? (
          <Row className="justify-content-center my-5">
            <Col md={6}>
              <Alert variant="danger" className="text-center">{error}</Alert>
            </Col>
          </Row>
        ) : (
          <Row>
            {products.map((mush) => {
              let plainPrices = null;
              if (mush.prices && Object.keys(mush.prices).length > 0) {
                plainPrices = mush.prices;
              }

              return (
                <Cards
                  key={mush._id}
                  id={mush._id}
                  type={mush.type}
                  image={`http://localhost:5000${mush.image}`}
                  rating={mush.rating || 5}
                  title={mush.name}
                  paragraph={mush.description}
                  price={mush.price}
                  measures={mush.measures && mush.measures.length > 0 ? mush.measures : null}
                  prices={plainPrices}
                  renderRatingIcons={renderRatingIcons}
                  modelUrl={mush.modelUrl}
                />
              );
            })}
          </Row>
        )}
      </Container>
    </section>
  );
}

export default Section3;
