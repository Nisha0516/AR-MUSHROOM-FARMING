import React, { useContext, useState } from "react";
import { Col, Card, Button, Modal, Row, Form, Spinner } from "react-bootstrap";
import { CartContext } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { userAPI, mushroomAPI } from "../../services/api";
import ProductReviews from "../Shop/ProductReviews";

function Cards({ id, type, image, rating, title, paragraph, price, measures, prices, renderRatingIcons, modelUrl, iosModelUrl }) {
  const { addToCart } = useContext(CartContext);
  const [showProcess, setShowProcess] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [selectedMeasure, setSelectedMeasure] = useState(measures && measures.length > 0 ? measures[0] : null);
  const [showReviews, setShowReviews] = useState(false);
  const [currentMushroom, setCurrentMushroom] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const navigate = useNavigate();

  const handleToggleWishlist = async () => {
    try {
      const res = await userAPI.toggleWishlist(id);
      if (res.success) {
        setIsFav(!isFav);
      }
    } catch (err) {
      alert("Please login to manage your wishlist.");
    }
  };

  const handleOpenReviews = async () => {
    setShowReviews(true);
    setLoadingReviews(true);
    try {
      const res = await mushroomAPI.getById(id);
      if (res.success) {
        setCurrentMushroom(res.data);
      }
    } catch (err) {
      console.error("Failed to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  const currentPrice = selectedMeasure && prices && prices[selectedMeasure] ? prices[selectedMeasure] : price;

  const handleAddToCart = () => {
    addToCart({
      id: selectedMeasure ? `${id}-${selectedMeasure}` : id,
      title: selectedMeasure ? `${title} (${selectedMeasure})` : title,
      price: currentPrice,
      image,
      modelUrl,
      measure: selectedMeasure
    });
    setShowProcess(true);
  };

  const hasArModel = !!(modelUrl || iosModelUrl);

  return (
    <>
      <Col sm={6} lg={4} xl={3} className="mb-4">
        <Card className="h-100 border-0 shadow-sm overflow-hidden d-flex flex-column">
          <div className="card_image_container position-relative">
            <Card.Img variant="top" src={image} className="img-fluid" style={{ height: '220px', objectFit: 'cover' }} />
            {type === 'produce' && (
              <span className="position-absolute top-0 start-0 m-3 badge bg-success">Fresh Produce</span>
            )}
          </div>

          <Card.Body className="d-flex flex-column">
            <div className="d-flex align-items-start justify-content-between mb-2">
              <Card.Title className="mb-0 card-title fw-bold text-dark" style={{ fontSize: '1.1rem' }}>{title}</Card.Title>
              <div className="wishlist ms-2" onClick={handleToggleWishlist} style={{ cursor: 'pointer' }}>
                <i className={`bi ${isFav ? 'bi-heart-fill text-danger' : 'bi-heart text-muted'}`} style={{ fontSize: '1.2rem' }}></i>
              </div>
            </div>

            {/* PRODUCT DESCRIPTION */}
            <Card.Text
              className="text-muted small mb-3"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '4.5em' // maintain uniform card heights
              }}
            >
              {paragraph}
            </Card.Text>

            {/* Measure Selection for Produce */}
            {type === 'produce' && measures && measures.length > 0 && (
              <div className="mb-3 mt-auto">
                <Form.Label className="small font-weight-bold text-muted mb-1">Select Pack Size:</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedMeasure}
                  onChange={(e) => setSelectedMeasure(e.target.value)}
                  className="border-1 bg-light shadow-none"
                >
                  {measures.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Form.Select>
              </div>
            )}

            <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top">
              <div className="menu_price">
                <h4 className="mb-0 text-dark fw-bold" style={{ letterSpacing: '-0.5px' }}>₨ {currentPrice}/-</h4>
              </div>
              <div className="item_rating text-warning" style={{ fontSize: '0.9rem' }}>
                {renderRatingIcons(rating)}
              </div>
            </div>

            <Row className="g-2 mt-3">
              <Col xs={12}>
                <Button
                  variant="dark"
                  className="w-100 rounded-pill fw-bold shadow-sm py-2"
                  onClick={handleAddToCart}
                >
                  <i className="bi bi-cart-plus me-2"></i>
                  Add to Cart
                </Button>
              </Col>
              {hasArModel && (
                <Col xs={12}>
                  <Button
                    variant="outline-dark"
                    size="sm"
                    className="w-100 rounded-pill"
                    onClick={() => navigate(`/ar-space/product/${id}`)}
                  >
                    <i className="bi bi-bounding-box-circles me-2"></i>
                    View in Your Space
                  </Button>
                </Col>
              )}
              <Col xs={12}>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="w-100 rounded-pill border-0 text-muted"
                  onClick={handleOpenReviews}
                >
                  <i className="bi bi-chat-text me-2"></i>
                  View Reviews
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>

      {/* Reviews Modal */}
      <Modal show={showReviews} onHide={() => setShowReviews(false)} centered size="lg" className="reviews-modal">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">{title} Reviews</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 pt-0" style={{ backgroundColor: '#111', borderRadius: '0 0 12px 12px' }}>
          {loadingReviews ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="warning" />
            </div>
          ) : (
            <ProductReviews 
              mushroomId={id} 
              initialReviews={currentMushroom?.reviews || []}
              onReviewAdded={handleOpenReviews} 
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Continue Process Modal */}
      <Modal show={showProcess} onHide={() => setShowProcess(false)} centered>
        <Modal.Body className="text-center p-5">
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
          </div>
          <h3 className="mb-3 font-weight-bold">Added to Cart!</h3>
          <p className="text-muted mb-4">
            <strong>{title}</strong> has been successfully added to your shopping cart.
          </p>
          <div className="d-grid gap-2">
            <Button
              variant="dark"
              size="lg"
              className="rounded-pill"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </Button>
            <Button
              variant="light"
              size="lg"
              className="rounded-pill text-muted border"
              onClick={() => setShowProcess(false)}
            >
              Keep Shopping
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Cards;
