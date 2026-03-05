import React, { useContext, useState } from "react";
import { Col, Card, Button, Modal, Row, Form } from "react-bootstrap";
import { CartContext } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import ARViewer from "../ARViewer";

function Cards({ id, type, image, rating, title, paragraph, price, measures, prices, renderRatingIcons, modelUrl }) {
  const { addToCart } = useContext(CartContext);
  const [showAR, setShowAR] = useState(false);
  const [showProcess, setShowProcess] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [selectedMeasure, setSelectedMeasure] = useState(measures ? measures[0] : null);
  const navigate = useNavigate();

  const currentPrice = selectedMeasure && prices ? prices[selectedMeasure] : price;

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

  return (
    <>
      <Col sm={6} lg={4} xl={3} className="mb-4">
        <Card className="h-100 border-0 shadow-sm overflow-hidden">
          <div className="card_image_container position-relative">
            <Card.Img variant="top" src={image} className="img-fluid" style={{ height: '220px', objectFit: 'cover' }} />
            {type === 'produce' && (
              <span className="position-absolute top-0 start-0 m-3 badge bg-success">Fresh Produce</span>
            )}
          </div>

          <Card.Body className="d-flex flex-column">
            <div className="d-flex align-items-start justify-content-between mb-2">
              <Card.Title className="mb-0 card-title">{title}</Card.Title>
              <div className="wishlist ms-2" onClick={() => setIsFav(!isFav)}>
                <i className={`bi ${isFav ? 'bi-heart-fill active' : 'bi-heart'}`}></i>
              </div>
            </div>

            <Card.Text className="card-text flex-grow-1">
              {paragraph}
            </Card.Text>

            {/* Measure Selection for Produce */}
            {type === 'produce' && measures && (
              <div className="mb-3">
                <Form.Label className="small font-weight-bold text-muted">Select Pack Size:</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedMeasure}
                  onChange={(e) => setSelectedMeasure(e.target.value)}
                  className="border-0 bg-light"
                >
                  {measures.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Form.Select>
              </div>
            )}

            <div className="d-flex align-items-center justify-content-between mt-auto mb-3">
              <div className="menu_price">
                <h5 className="mb-0">₨{currentPrice}</h5>
              </div>
              <div className="item_rating">
                {renderRatingIcons(rating)}
              </div>
            </div>

            <Row className="g-2">
              {type === 'service' && modelUrl && (
                <Col xs={12}>
                  <Button
                    variant="outline-secondary"
                    className="ar_btn w-100"
                    onClick={() => setShowAR(true)}
                  >
                    <i className="bi bi-badge-3d me-2"></i>3D Visualization
                  </Button>
                </Col>
              )}
              <Col xs={12}>
                <Button
                  className="add_to_card_btn w-100"
                  onClick={handleAddToCart}
                >
                  <i className="bi bi-bag-plus me-2"></i>
                  {type === 'service' ? "Add to Consultancy" : "Add to Cart"}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>

      {/* AR Modal */}
      <Modal show={showAR} onHide={() => setShowAR(false)} centered size="lg">
        <Modal.Header closeButton className="border-0">
          <Modal.Title>{title} - 3D Layout Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {modelUrl && (
            <div style={{ height: '500px' }}>
              <ARViewer src={modelUrl} alt={`3D model of ${title}`} />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-dark" onClick={() => setShowAR(false)}>
            Close Preview
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Continue Process Modal */}
      <Modal show={showProcess} onHide={() => setShowProcess(false)} centered>
        <Modal.Body className="text-center p-5">
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
          </div>
          <h3 className="mb-3 font-weight-bold">Added to Project!</h3>
          <p className="text-muted mb-4">
            <strong>{title}</strong> has been successfully added to your project cart. Would you like to finalize your details or continue exploring?
          </p>
          <div className="d-grid gap-2">
            <Button
              variant="danger"
              size="lg"
              onClick={() => navigate("/checkout")}
              style={{ backgroundColor: 'var(--light-red)', border: 'none' }}
            >
              Finalize & Checkout
            </Button>
            <Button
              variant="outline-secondary"
              size="lg"
              onClick={() => setShowProcess(false)}
            >
              Continue Exploring
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Cards;
