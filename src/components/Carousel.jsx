import React from "react";
import "./Carousel.css";

function Carousel() {
  return (
    <div className="carousel">
      <div className="carousel-item">
        <h1>UST VS. ADU</h1>
        <p>Basketball Tournament Round 2</p>
        <button className="reserve-btn">Reserve Now</button>
      </div>
      <div className="carousel-arrows">
        <span className="arrow left">&lt;</span>
        <span className="arrow right">&gt;</span>
      </div>
    </div>
  );
}

export default Carousel;
