"use strict";

const db = require("../models"); // Import the database models
const Event = db.Event; // Import the Event model

async function createPublishedTicketedEvents() {
 

    // Insert sample published ticketed events
    await Event.bulkCreate([
      {
        name: "UST vs. ADU",
        details: "Basketball Tournament Round 2",
        event_date: "2025-04-15",
        event_time: "18:00:00",
        event_end_time: "20:00:00",
        venue: "UST Quadricentennial Pavilion",
        category: "Sports",
        event_type: "ticketed",
        status: "open",
        visibility: "published",
      },
      {
        name: "UST vs. DLSU",
        details: "Basketball Tournament Round 3",
        event_date: "2025-04-20",
        event_time: "18:00:00",
        event_end_time: "20:00:00",
        venue: "UST Quadricentennial Pavilion",
        category: "Sports",
        event_type: "ticketed",
        status: "open",
        visibility: "published",
      },
      {
        name: "UST vs. FEU",
        details: "Basketball Tournament Round 4",
        event_date: "2025-04-25",
        event_time: "18:00:00",
        event_end_time: "20:00:00",
        venue: "UST Quadricentennial Pavilion",
        category: "Sports",
        event_type: "ticketed",
        status: "open",
        visibility: "published",
      },
      {
        name: "UST vs. NU",
        details: "Basketball Tournament Round 5",
        event_date: "2025-04-30",
        event_time: "18:00:00",
        event_end_time: "20:00:00",
        venue: "UST Quadricentennial Pavilion",
        category: "Sports",
        event_type: "ticketed",
        status: "open",
        visibility: "published",
      },
      
    ]);

}

createPublishedTicketedEvents();