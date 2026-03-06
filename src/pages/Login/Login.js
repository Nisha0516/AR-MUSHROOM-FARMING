import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { userAPI } from "../../services/api";
import { useUser } from "../../context/UserContext";
import "../../styles/HomeStyle.css";

const Login = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const credentials = {
        email: email,
        password: password
      };

      const response = await userAPI.login(credentials);

      if (response.success) {
        setSuccess("Login successful! Redirecting...");
        // Store user data and token in context
        login(response.data.user, response.data.token);

        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setError(response.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login_section py-5">
      <Container>
        <Row>
          <Col lg={6} className="mx-auto">
            <div className="login_container p-5 bg-white rounded shadow">
              <h2 className="login_title text-center mb-5">User Login</h2>

              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="mb-4">
                  {success}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="login_input"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="login_input"
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="btn order_now w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </Form>

              <div className="text-center">
                <p className="mb-2">
                  Don't have an account?{" "}
                  <Link to="/signup" style={{ color: "var(--light-red)", textDecoration: "none", fontWeight: "600" }}>
                    Sign Up
                  </Link>
                </p>
                <p>
                  <a href="#forgot" style={{ color: "var(--light-red)", textDecoration: "none", fontSize: "14px" }}>
                    Forgot Password?
                  </a>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Login;
