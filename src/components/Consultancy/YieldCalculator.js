import React, { useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { FaChartLine } from "react-icons/fa";

const YieldCalculator = () => {
    const [area, setArea] = useState(1000); // sq ft
    const [cycles, setCycles] = useState(4); // per year
    const [marketPrice, setMarketPrice] = useState(6); // $ per lb

    // Calculations
    // Assume a yield of 4 lbs per sq ft per cycle

    return (
        <div className="glass-card yield-calculator">
            <div className="text-center mb-4">
                <FaChartLine size={48} className="text-warning mb-3" />
                <h3 className="mb-1 text-white">Projected Yield Calculator</h3>
                <p className="text-white-50">Estimate your annual revenue based on facility size and market rates.</p>
            </div>

            <Row>
                <Col md={12}>
                    <div className="calc-slider">
                        <div className="calc-label text-white">
                            <span>Growing Area (Sq. Ft.)</span>
                            <span className="text-warning">{area.toLocaleString()} sq ft</span>
                        </div>
                        <Form.Range
                            min={100}
                            max={10000}
                            step={100}
                            value={area}
                            onChange={(e) => setArea(Number(e.target.value))}
                        />
                    </div>

                    <div className="calc-slider">
                        <div className="calc-label text-white">
                            <span>Growth Cycles per Year</span>
                            <span className="text-warning">{cycles} cycles</span>
                        </div>
                        <Form.Range
                            min={2}
                            max={8}
                            step={1}
                            value={cycles}
                            onChange={(e) => setCycles(Number(e.target.value))}
                        />
                    </div>

                    <div className="calc-slider">
                        <div className="calc-label text-white">
                            <span>Estimated Market Price (₨ per kg)</span>
                            <span className="text-warning">₨{marketPrice}</span>
                        </div>
                        <Form.Range
                            min={150}
                            max={800}
                            step={10}
                            value={marketPrice}
                            onChange={(e) => setMarketPrice(Number(e.target.value))}
                        />
                    </div>
                </Col>

                <Col md={12}>
                    <div className="result-box mt-4">
                        <h5 className="result-label">Projected Annual Revenue</h5>
                        {/* Note: the formula above was in lbs/$, updating to kg/₨ for consistency with the rest of the app */}
                        <div className="result-value">
                            ₨{(area * 1.5 * cycles * marketPrice).toLocaleString()}
                        </div>
                        <p className="text-white-50 small mb-0 mt-2">
                            *Based on an average yield of 1.5 kg per sq. ft. per cycle
                        </p>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default YieldCalculator;
