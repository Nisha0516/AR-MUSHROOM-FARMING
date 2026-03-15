import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Badge, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import Layout from "../../components/Layouts/Layout";
import { CartContext } from "../../context/CartContext";
import { mushroomAPI } from "../../services/api";

function resolvePrice(product, measure) {
  if (!product) return 0;
  if (measure && product.prices && product.prices[measure] != null) return Number(product.prices[measure]) || 0;
  return Number(product.price) || 0;
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);

  const [selectedMeasure, setSelectedMeasure] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await mushroomAPI.getById(id);
        if (!mounted) return;
        if (res?.success) {
          setProduct(res.data);
          const measures = Array.isArray(res.data?.measures) ? res.data.measures : [];
          setSelectedMeasure(measures.length ? measures[0] : null);
        } else {
          setError(res?.message || "Failed to load product.");
        }
      } catch (e) {
        if (!mounted) return;
        setError("Network error connecting to the database.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const currentPrice = useMemo(() => resolvePrice(product, selectedMeasure), [product, selectedMeasure]);
  const hasArModel = !!(product?.modelUrl || product?.iosModelUrl);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: selectedMeasure ? `${product._id}-${selectedMeasure}` : product._id,
      title: selectedMeasure ? `${product.name} (${selectedMeasure})` : product.name,
      price: currentPrice,
      image: product.image,
      modelUrl: product.modelUrl,
      measure: selectedMeasure,
    });
    navigate("/checkout");
  };

  return (
    <Layout>
      <Container className="py-4">
        <Button variant="link" className="text-decoration-none ps-0" onClick={() => navigate("/shop")}>
          <i className="bi bi-arrow-left me-2"></i>Back to Shop
        </Button>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <div className="text-muted mt-3">Loading product...</div>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : product ? (
          <Row className="g-4 align-items-start">
            <Col md={6}>
              <div className="rounded-4 overflow-hidden shadow-sm bg-white">
                <img
                  src={product.image || "/uploads/mush-11.jpg"}
                  alt={product.name}
                  style={{ width: "100%", height: 420, objectFit: "cover" }}
                />
              </div>
            </Col>
            <Col md={6}>
              <h2 className="fw-bold">{product.name}</h2>
              <div className="text-muted mb-3">{product.category}</div>

              <div className="mb-3">
                {product.isAvailable ? (
                  <Badge bg="success" className="px-3 py-2">AVAILABLE</Badge>
                ) : (
                  <Badge bg="secondary" className="px-3 py-2">INACTIVE</Badge>
                )}
                <span className="ms-3 text-muted small">Stock: {product.stock ?? 0}</span>
              </div>

              <p className="text-muted">{product.description}</p>

              {Array.isArray(product.measures) && product.measures.length > 0 && (
                <div className="mb-3">
                  <Form.Label className="small text-muted fw-bold mb-1">Select Pack Size</Form.Label>
                  <Form.Select
                    value={selectedMeasure || ""}
                    onChange={(e) => setSelectedMeasure(e.target.value)}
                    className="rounded-pill shadow-sm"
                  >
                    {product.measures.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </Form.Select>
                </div>
              )}

              <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                <div className="fw-bold" style={{ fontSize: "1.4rem" }}>₹ {currentPrice}/-</div>
                <div className="d-flex gap-2">
                  <Button variant="dark" className="rounded-pill fw-bold" onClick={handleAddToCart}>
                    <i className="bi bi-cart-plus me-2"></i>
                    Add to Cart
                  </Button>
                  {hasArModel && (
                    <Button variant="outline-dark" className="rounded-pill fw-bold" onClick={() => navigate(`/ar-space/product/${product._id}`)}>
                      <i className="bi bi-bounding-box-circles me-2"></i>
                      View in AR
                    </Button>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        ) : null}
      </Container>
    </Layout>
  );
}
