const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const authenticate = require("../middleware/authenticate");
const authorizeAdmin = require("../middleware/authorizeAdmin.js"); // Middleware for admin access

// Reservation routes for end-user
router.post("/reservations", authenticate, reservationController.createReservation);
router.get("/reservations/user/:user_id", authenticate, reservationController.getUserReservations);

// Reservation routes for admin
router.get("/reservations", authenticate, authorizeAdmin, reservationController.getAllReservations);
router.get("/reservations/:event_id", authenticate, authorizeAdmin, reservationController.getReservationsByEvent);
router.patch( "/reservations/:reservation_id/mark-claimed",authenticate, authorizeAdmin, reservationController.markAsClaimed);
router.patch("/reservations/:reservation_id/reinstate",authenticate, authorizeAdmin, reservationController.reinstateReservation);
router.patch( "/reservations/restore",authenticate, reservationController.restoreUnclaimedReservations);
router.post("/reservations/validate-qr",authenticate, authorizeAdmin,reservationController.validateReservationByQRCode);
router.post("/reservations/claim-qr",authenticate, authorizeAdmin, reservationController.markAsClaimedByQRCode);


module.exports = router;