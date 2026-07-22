const express = require("express");
const router = express.Router();

const BookingController = require("../Controller/BookingController");

router.post("/create", BookingController.createBooking);
router.get("/user-bookings", BookingController.getUserBookings);

router.get("/hotel-bookings", BookingController.getHotelBookings);
router.patch("/approve", BookingController.approveBooking);
router.patch("/reject", BookingController.rejectBooking);
router.patch("/checkin", BookingController.checkIn);
router.patch("/checkout", BookingController.checkOut);

router.get("/all-bookings", BookingController.getAdminBookings);

module.exports = router;