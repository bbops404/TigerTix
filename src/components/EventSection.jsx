import React from "react";
import "./EventSection.css";

function EventSection({ title }) {
  return (
    <section className="event-section ">
      <h2>{title}</h2>
      <p></p>
      <div className="event-slider">
        <div className="event-arrow left">&lt;</div>
        
        <div className="event-arrow right">&gt;</div>
      </div>
    </section>
    
  );
}

export default EventSection;
