import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import "./userbooking.css";

function UserBooking() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("currentuser") || "null");

  // ================== FETCH USER BOOKINGS ==================

  useEffect(() => {
    if (!currentUser?._id) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          "http://localhost:1100/booking/user-bookings",
          { params: { userId: currentUser._id } }
        );

        if (response.data.success) {
          setBookings(response.data.bookings);
        }
      } catch (error) {
        console.log(error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser?._id]);

  // ================== CARD ANIMATION ==================

  useEffect(() => {
    if (loading || !listRef.current?.children.length) return;

    const ctx = gsap.context(() => {
      gsap.from(listRef.current.children, {
        opacity: 0,
        y: 30,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
      });
    }, listRef);

    return () => ctx.revert();
  }, [loading, bookings.length]);

  // ================== STATUS BADGE STYLE ==================

  const statusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "approved":
        return "status-approved";
      case "checkIn":
        return "status-checkin";
      case "checkOut":
        return "status-checkout";
      case "rejected":
        return "status-rejected";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ================== NOT LOGGED IN ==================

  if (!currentUser) {
    return (
      <div className="user-no-hotel">
        <h2>Please Login</h2>
        <p>You need to be logged in to view your bookings.</p>
        <button
          onClick={() => navigate("/login")}
          className="user-back-hotels-btn"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="user-bookings-page">
      <h2 className="user-section-title">My Bookings</h2>

      {loading ? (
        <p>Loading your bookings...</p>
      ) : bookings.length === 0 ? (
        <div className="user-empty-message">
          <p className="user-empty-room-text">
            You haven't made any bookings yet.
          </p>
          <button
            onClick={() => navigate("/userdashboard")}
            className="user-back-hotels-btn"
          >
            Browse Hotels
          </button>
        </div>
      ) : (
        <div className="user-bookings-list" ref={listRef}>
          {bookings.map((booking) => (
            <div className="user-booking-card" key={booking._id}>
              <div className="user-booking-image">
                {booking.roomId?.images?.length > 0 ? (
                  <img
                    src={booking.roomId.images[0]}
                    alt="Room"
                    className="user-card-image"
                  />
                ) : (
                  <div className="user-image-placeholder">🛏️ No Photo</div>
                )}
              </div>

              <div className="user-booking-details">
                <div className="user-booking-header">
                  <h3>{booking.hotelId?.hotelname || "Hotel"}</h3>
                  <span className={`user-status-badge ${statusClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <p className="user-booking-room">
                  Room #{booking.roomId?.roomNumber} · {booking.roomId?.roomType}
                </p>

                <div className="user-booking-dates">
                  <div>
                    <span className="user-booking-label">Check In</span>
                    <span className="user-booking-value">
                      {formatDate(booking.startDate)}
                    </span>
                  </div>
                  <div>
                    <span className="user-booking-label">Check Out</span>
                    <span className="user-booking-value">
                      {formatDate(booking.endDate)}
                    </span>
                  </div>
                </div>

                <div className="user-booking-footer">
                  <span className="user-booking-price">₹{booking.price}</span>
                  <span className="user-booking-id">
                    Booking ID: {booking._id}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserBooking;