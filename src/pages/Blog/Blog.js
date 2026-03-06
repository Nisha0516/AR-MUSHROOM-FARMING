import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Layout from "../../components/Layouts/Layout";
import "../../styles/HomeStyle.css";

const Blog = () => {
    const posts = [
        {
            id: 1,
            title: "Scaling Up: From Hobbyist to Commercial Grower",
            date: "November 5, 2024",
            excerpt: "Learn the essential steps to transition your small-scale mushroom operation into a profitable enterprise using smart environmental controls.",
            image: "https://images.unsplash.com/photo-1594916609949-37f00042d38e?auto=format&fit=crop&q=80&w=800",
            author: "Mycological Experts",
        },
        {
            id: 2,
            title: "The Importance of Quality Genetics in Spore Banks",
            date: "October 20, 2024",
            excerpt: "Why starting with vigorous, clean liquid culture from a certified spore bank can double your biological efficiency and reduce contamination.",
            image: "https://images.unsplash.com/photo-1510626353926-d62fceb37340?auto=format&fit=crop&q=80&w=800",
            author: "Dr. Elena Rostova",
        },
        {
            id: 3,
            title: "How Advanced Farming Software Reduces Climate Intuition Errors",
            date: "October 10, 2024",
            excerpt: "Discover how real-time augmented reality overlays on your farm's climate data can prevent catastrophic crop failures before they happen.",
            image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
            author: "Tech & Innovation Team",
        }
    ];

    return (
        <Layout>
            <section className="contact_hero_section py-5 bg-dark text-white text-center">
                <Container>
                    <Row>
                        <Col lg={12}>
                            <h1 className="display-4 font-weight-bold mb-3">The Mushroom Matrix</h1>
                            <p className="lead">
                                Latest strategies, genetic breakthroughs, and tech updates in mycological farming.
                            </p>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section className="contact_content py-5">
                <Container>
                    <Row>
                        {posts.map((post) => (
                            <Col lg={4} md={6} className="mb-4" key={post.id}>
                                <Card className="h-100 border-0 shadow-sm blog-card">
                                    <div style={{ height: "200px", overflow: "hidden" }}>
                                        <Card.Img
                                            variant="top"
                                            src={post.image}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    </div>
                                    <Card.Body className="d-flex flex-column">
                                        <div className="text-muted small mb-2 d-flex justify-content-between">
                                            <span style={{ color: 'var(--light-red)' }}>{post.date}</span>
                                            <span>By {post.author}</span>
                                        </div>
                                        <Card.Title style={{ fontFamily: 'var(--oswald-font)', color: 'var(--light-black)' }}>{post.title}</Card.Title>
                                        <Card.Text style={{ color: 'var(--grey)' }}>{post.excerpt}</Card.Text>
                                        <div className="mt-auto pt-3">
                                            <button className="submit-btn" style={{ padding: '8px 16px', borderRadius: '4px', border: 'none' }}>Read More</button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>
        </Layout>
    );
};

export default Blog;
