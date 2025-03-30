const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);
router.post("/", eventController.createEvent);
router.put("/:id", eventController.updateEvent);
router.delete("/:id", eventController.deleteEvent);
router.put(
  "/events/:event_id/reservation-period",
  eventController.updateReservationPeriod
);
router.put("/:id/archive", eventController.archiveEvent);

module.exports = router;
