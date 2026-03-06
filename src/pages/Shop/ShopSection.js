import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner, Alert, Form, Button } from "react-bootstrap";
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

// Available expected categories from the database schema
const CATEGORIES = ["All", "Kit", "Supplies", "Equipment", "Oyster", "Other"];

function ShopSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtering State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await mushroomAPI.getAll();
        if (response.success) {
          setProducts(response.data);
        } else {
          setError("Failed to load inventory from server.");
        }
      } catch (err) {
        setError("Network error connecting to the database.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter Logic
  const filteredProducts = products.filter((mush) => {
    const matchesSearch = mush.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          mush.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || mush.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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

        {/* Search and Filter Controls */}
        <Row className="mb-5 justify-content-center">
          <Col md={6} className="mb-3 mb-md-0">
            <Form.Control
              type="text"
              placeholder="Search for spawn, kits, supplies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-pill shadow-sm"
              style={{ padding: "0.75rem 1.5rem" }}
            />
          </Col>
          <Col md={12} className="mt-4 text-center d-flex flex-wrap justify-content-center gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "warning" : "outline-secondary"}
                className={`rounded-pill px-4 ${activeCategory === cat ? "text-dark fw-bold shadow-sm" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
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
          <>
            {filteredProducts.length === 0 ? (
              <Row className="justify-content-center my-5 text-center">
                <Col md={8}>
                  <h4 className="text-muted">No products found matching your search criteria.</h4>
                  <Button variant="link" onClick={() => { setSearchTerm(""); setActiveCategory("All"); }}>
                    Clear Filters
                  </Button>
                </Col>
              </Row>
            ) : (
              <Row>
                {filteredProducts.map((mush) => {
                  // Pre-process prices object from mongoose Map to plain object for the Cards component
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
          </>
        )}
      </Container>
    </section>
  );
}

export default ShopSection;
