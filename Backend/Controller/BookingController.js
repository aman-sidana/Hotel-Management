const Booking = require("../Model/BookingModel");
const Hotel = require("../Model/HotelModel");
const admin = require("../Model/AdminModel")
const UserModel = require("../Model/UserModel");
const RoomModel = require("../Model/RoomModel");



exports.createBooking = async (req, res) => {
  try {
    const {
      userId,
      hotelId,
      roomId,
      price,
      startDate,
      endDate,
      couponId,
    } = req.body;

    if (
      !userId ||
      !hotelId ||
      !roomId ||
      !price ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found.",
      });
    }

    const room = await RoomModel.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    if (!room.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Room is already booked.",
      });
    }

    const booking = await Booking.create({
      userId,
      adminId: hotel.adminId,
      hotelId,
      roomId,
      price,
      startDate,
      endDate,
      couponId: couponId || null,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      booking,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.query;

    const bookings = await Booking.find({ userId })
      .populate("hotelId")
      .populate("roomId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getHotelBookings = async (req, res) => {
  try {
    const { hotelId } = req.query;

    const bookings = await Booking.find({ hotelId })
      .populate("userId", "name email phone")
      .populate("roomId");

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAdminBookings = async (req, res) => {
  try {

    const { adminId } = req.query;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin Id is required",
      });
    }

    const bookings = await Booking.find({ adminId })
      .populate("userId", "name email phone")
      .populate("hotelId", "hotelname hoteladdress")
      .populate("roomId", "roomNumber roomType pricePerNight")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalBookings: bookings.length,
      bookings,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
exports.approveBooking = async (req, res) => {
  try {
    const { id } = req.query;

    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        status: "approved",
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Booking Approved.",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.rejectBooking = async (req, res) => {
  try {
    const { id } = req.query;

    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        status: "rejected",
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Booking Rejected.",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.checkIn = async (req, res) => {
  try {
    const { id } = req.query;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = "checkIn";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Customer Checked In",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.checkOut = async (req, res) => {
  try {
    const { id } = req.query;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = "checkOut";
    await booking.save();

    await Room.findByIdAndUpdate(booking.roomId, {
      isAvailable: true,
    });

    res.status(200).json({
      success: true,
      message: "Customer Checked Out",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

