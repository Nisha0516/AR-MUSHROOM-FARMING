import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Image1 from "../../assets/menu/mush-11.jpg";
import Image2 from "../../assets/menu/mush-12.jpg";
import Image3 from "../../assets/menu/mush-13.jpg";
import Image4 from "../../assets/menu/mush-14.jpg";
import Cards from "../../components/Layouts/Cards";

// Mock Data Cards
const mockData = [
  {
    id: "0001",
    image: Image1,
    title: "button mushroom",
    paragraph: "high production high taste",
    rating: 5,
    price: 99,
    modelUrl: "https://modelviewer.dev/shared-assets/models/shishkebab.glb"
  },
  {
    id: "0002",
    image: Image2,
    title: "Oyster mushroom",
    paragraph: "Delicate, mild taste with a velvety texture",
    rating: 4.5,
    price: 99,
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb"
  },
  {
    id: "0003",
    image: Image3,
    title: "King Oyster",
    paragraph: "Thick stems with a rich, savory taste, perfect for grilling or slicing.",
    rating: 4,
    price: 110,
  },
  {
    id: "0004",
    image: Image4,
    title: "Beech",
    paragraph: "Small, nutty, slightly sweet, with a firm crunch.",
    rating: 3.5,
    price: 99.25,
  },


  // Add more mock data objects as needed
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

function Section3() {
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
              image={cardData.image}
              rating={cardData.rating}
              title={cardData.title}
              paragraph={cardData.paragraph}
              price={cardData.price}
              renderRatingIcons={renderRatingIcons}
              modelUrl={cardData.modelUrl}
            />
          ))}
        </Row>
      </Container>
    </section>
  );
}

export default Section3;
