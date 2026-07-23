import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import "./userbookings.css";

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
          setBookings(response.data.bookings || []);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
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
        y: 25,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "transform,opacity",
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
      <div className="user-bookings-page">
        <div className="user-no-hotel">
          <h2>Please Login</h2>
          <p>You need to be logged in to view your bookings dashboard.</p>
          <button
            onClick={() => navigate("/login")}
            className="user-back-hotels-btn"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-bookings-page">
      {/* Top Header Bar */}
      <div className="bookings-header-bar">
        <button
          onClick={() => navigate("/")}
          className="user-back-hotels-btn user-back-button"
        >
          ← Back to Dashboard
        </button>
        <h1 className="bookings-page-title">My Bookings</h1>
      </div>

      {loading ? (
        <div className="bookings-loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your booking history...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="user-empty-message">
          <div className="empty-icon">🧳</div>
          <h3>No Bookings Found</h3>
          <p className="user-empty-room-text">
            You haven't reserved any hotel rooms yet.
          </p>
          <button
            onClick={() => navigate("/userdashboard")}
            className="user-back-hotels-btn"
          >
            Browse Available Hotels
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
                    alt="Room Preview"
                    className="user-card-image"
                  />
                ) : (
                  <div className="user-image-placeholder">🛏️ Photo Unavailable</div>
                )}
              </div>

              <div className="user-booking-details">
                <div className="user-booking-header">
                  <h3>{booking.hotelId?.hotelname || "Hotel Reservation"}</h3>
                  <span className={`user-status-badge ${statusClass(booking.status)}`}>
                    {booking.status || "Pending"}
                  </span>
                </div>

                <p className="user-booking-room">
                  Room #{booking.roomId?.roomNumber || "N/A"} · {booking.roomId?.roomType || "Standard"}
                </p>

                <div className="user-booking-dates">
                  <div className="date-box">
                    <span className="user-booking-label">Check In</span>
                    <span className="user-booking-value">
                      {formatDate(booking.startDate)}
                    </span>
                  </div>
                  <div className="date-box">
                    <span className="user-booking-label">Check Out</span>
                    <span className="user-booking-value">
                      {formatDate(booking.endDate)}
                    </span>
                  </div>
                </div>

                <div className="user-booking-footer">
                  <div className="price-container">
                    <span className="price-label">Total Amount</span>
                    <span className="user-booking-price">₹{booking.price}</span>
                  </div>
                  <span className="user-booking-id" title={booking._id}>
                    ID: #{booking._id?.slice(-6)}
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