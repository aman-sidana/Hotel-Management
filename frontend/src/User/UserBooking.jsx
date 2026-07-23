import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";

import Navbar from "../genericComponents/Navbar";

function UserBooking() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("currentuser") || "null");


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

  const statusBadgeClass = (status) => {
    const base = "inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize whitespace-nowrap";
    switch (status) {
      case "pending": return `${base} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`;
      case "approved": return `${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`;
      case "checkIn": return `${base} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`;
      case "checkOut": return `${base} bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400`;
      case "rejected":
      case "cancelled": return `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
      default: return `${base} bg-slate-100 text-slate-500`;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  // ================== NOT LOGGED IN ==================

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Please Login</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">You need to be logged in to view your bookings.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white
              bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30
              transition-all duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      {/* Industry Standard Navbar */}
      <Navbar />

      <div className="px-5 py-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 dark:text-slate-500">Loading your booking history...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🧳</div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Bookings Found</h3>
            <p className="text-slate-400 dark:text-slate-500 mb-6">You haven't reserved any hotel rooms yet.</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-xl font-semibold text-sm text-white
                bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30
                transition-all duration-200"
            >
              Browse Available Hotels
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5" ref={listRef}>
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="flex flex-col sm:flex-row rounded-2xl overflow-hidden border shadow-sm
                  bg-white dark:bg-slate-800
                  border-slate-200 dark:border-slate-700
                  hover:border-blue-400 dark:hover:border-blue-500
                  hover:shadow-md transition-all duration-200"
              >
                {/* Room Image */}
                <div className="w-full sm:w-48 h-40 sm:h-auto bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                  {booking.roomId?.images?.length > 0 ? (
                    <img src={booking.roomId.images[0]} alt="Room Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm">🛏️ No Photo</div>
                  )}
                </div>

                {/* Booking Details */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                        {booking.hotelId?.hotelname || "Hotel Reservation"}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Room #{booking.roomId?.roomNumber || "N/A"} · {booking.roomId?.roomType || "Standard"}
                      </p>
                    </div>
                    <span className={statusBadgeClass(booking.status)}>
                      {booking.status || "Pending"}
                    </span>
                  </div>

                  <div className="flex gap-6 mb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Check In</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatDate(booking.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Check Out</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatDate(booking.endDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Total Amount</p>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{booking.price}</p>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      ID: #{booking._id?.slice(-6)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserBooking;