import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Image1 from "../../assets/menu/mush-11.jpg";
import Image2 from "../../assets/menu/mush-12.jpg";
import Image3 from "../../assets/menu/mush-13.jpg";
import Image4 from "../../assets/menu/mush-14.jpg";
import Cards from "../../components/Layouts/Cards";

// Hybrid Mock Data: Consultancy & Fresh Produce
const mockData = [
  {
    id: "s001",
    type: "service",
    image: Image1,
    title: "Hobbyist Grow Kit",
    paragraph: "Complete starter kit with pre-colonized substrate and humidity tent. Yields up to 2kg.",
    rating: 5,
    price: 1500,
    modelUrl: "https://modelviewer.dev/shared-assets/models/shishkebab.glb"
  },
  {
    id: "p001",
    type: "produce",
    image: Image2,
    title: "Fresh Oyster Packets",
    paragraph: "Organic, farm-fresh oyster mushrooms harvested daily. Sustainably packed.",
    rating: 5,
    price: 15,
    measures: ["200g", "500g", "1kg"],
    prices: { "200g": 15, "500g": 35, "1kg": 65 }
  },
  {
    id: "s002",
    type: "service",
    image: Image3,
    title: "Spore Bank Access",
    paragraph: "Annual access to exclusive high-yield strains and genetic consultation.",
    rating: 5,
    price: 5000,
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb"
  },
  {
    id: "p002",
    type: "produce",
    image: Image4,
    title: "King Oyster Fresh Pack",
    paragraph: "Premium King Oyster mushrooms. Thick stems and meaty texture.",
    rating: 4.8,
    price: 25,
    measures: ["250g", "500g", "1kg"],
    prices: { "250g": 25, "500g": 45, "1kg": 85 }
  },
  {
    id: "s003",
    type: "service",
    image: Image1,
    title: "AR Farm Software",
    paragraph: "Enterprise-grade AR environmental tracking and yield analytics dashboard.",
    rating: 5,
    price: 15000,
    modelUrl: "https://modelviewer.dev/shared-assets/models/shishkebab.glb"
  },
  {
    id: "p003",
    type: "produce",
    image: Image2,
    title: "Exotic Beech Clusters",
    paragraph: "Clean, crisp beech mushrooms in convenient measure-controlled packets.",
    rating: 4.5,
    price: 20,
    measures: ["200g", "400g"],
    prices: { "200g": 20, "400g": 38 }
  }
];

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

function ShopSection() {
  return (
    <section className="menu_section">
      <Container>
        <Row>
          <Col lg={{ span: 8, offset: 2 }} className="text-center mb-5">
            <h2>OUR PREMIUM CONSULTANCY</h2>
            <p className="para">
              Expert AR Development & Farming Layouts
              Cost-effective digital solutions for agriculture.
            </p>
          </Col>
        </Row>
        <Row>
          {mockData.map((cardData, index) => (
            <Cards
              key={index}
              id={cardData.id}
              type={cardData.type}
              image={cardData.image}
              rating={cardData.rating}
              title={cardData.title}
              paragraph={cardData.paragraph}
              price={cardData.price}
              measures={cardData.measures}
              prices={cardData.prices}
              renderRatingIcons={renderRatingIcons}
              modelUrl={cardData.modelUrl}
            />
          ))}
        </Row>
      </Container>
    </section>
  );
}

export default ShopSection;
