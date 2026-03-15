import React, { useState } from 'react';
import { Form, Button, ListGroup, Badge } from 'react-bootstrap';
import { mushroomAPI } from '../../services/api';

const ProductReviews = ({ mushroomId, initialReviews, onReviewAdded }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const res = await mushroomAPI.addReview(mushroomId, { rating, comment });
            if (res.success) {
                setComment('');
                setRating(5);
                if (onReviewAdded) onReviewAdded();
            }
        } catch (err) {
            setError(err.message || 'Failed to submit review. Are you logged in?');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-5">
            <h4 className="mb-4">Customer Reviews</h4>
            
            <ListGroup variant="flush" className="mb-4">
                {initialReviews && initialReviews.length > 0 ? (
                    initialReviews.map((review, idx) => (
                        <ListGroup.Item key={idx} className="bg-transparent text-white border-secondary px-0 py-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fw-bold">{review.user}</span>
                                <Badge bg="warning" text="dark">
                                    {review.rating} ★
                                </Badge>
                            </div>
                            <p className="mb-1 text-white-50 small">{review.comment}</p>
                            <small className="text-muted">{new Date(review.date).toLocaleDateString()}</small>
                        </ListGroup.Item>
                    ))
                ) : (
                    <p className="text-muted">No reviews yet. Be the first to share your experience!</p>
                )}
            </ListGroup>

            <Form onSubmit={handleSubmit} className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <h5>Leave a Review</h5>
                {error && <p className="text-danger small">{error}</p>}
                <Form.Group className="mb-3">
                    <Form.Label className="small text-white-50">Rating</Form.Label>
                    <Form.Select 
                        size="sm" 
                        value={rating} 
                        onChange={(e) => setRating(e.target.value)}
                        className="bg-dark text-white border-secondary"
                    >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Average</option>
                        <option value="2">2 - Poor</option>
                        <option value="1">1 - Terrible</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label className="small text-white-50">Comment</Form.Label>
                    <Form.Control 
                        as="textarea" 
                        rows={3} 
                        size="sm"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What do you think of this product?"
                        className="bg-dark text-white border-secondary"
                        required
                    />
                </Form.Group>
                <Button 
                    type="submit" 
                    variant="warning" 
                    size="sm" 
                    disabled={submitting}
                    className="fw-bold px-4"
                >
                    {submitting ? 'Submitting...' : 'Post Review'}
                </Button>
            </Form>
        </div>
    );
};

export default ProductReviews;
