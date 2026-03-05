import React from "react";
import Layout from "../../components/Layouts/Layout";
import "../../styles/HomeStyle.css";
import Section1 from "./Section1";
import Section3 from "./Section3";
import Section4 from "./Section4";
import Section6 from "./Section6";
import Section7 from "./Section7";
// Link removed from top-of-page; navbar still controls site navigation

const Home = () => {
  return (
    <Layout>
      <div className="home-page">
        {/* top-of-page link removed */}


        <Section1 />
        <Section3 />
        <Section4 />
        <Section6 />
        <Section7 />
      </div>
    </Layout>
  );
};

export default Home;
