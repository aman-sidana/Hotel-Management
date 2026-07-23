import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { gsap } from "gsap";

function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [myHotel, setMyHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const listRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("currentuser") || "null");

  // ================== FETCH ALL BOOKINGS ==================
  const fetchBookings = async () => {
    if (!currentUser?.email) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const hotelsRes = await axios.get("http://localhost:1100/hotel/allhotels");
      const allHotels = hotelsRes.data || [];

      const myHotel = allHotels.find(
        (h) => h.hotelemail?.toLowerCase() === currentUser.email.toLowerCase()
      );

      if (!myHotel) {
        setBookings([]);
        setLoading(false);
        return;
      }

      setMyHotel(myHotel);

      const response = await axios.get(
        "http://localhost:1100/booking/hotel-bookings",
        { params: { hotelId: myHotel._id } }
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

  useEffect(() => {
    fetchBookings();
  }, [currentUser?.email]);

  // ================== CARD ANIMATION ==================
  useEffect(() => {
    if (loading || !listRef.current?.children.length) return;

    const ctx = gsap.context(() => {
      gsap.from(listRef.current.children, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
      });
    }, listRef);

    return () => ctx.revert();
  }, [loading, bookings.length, activeTab]);

  // ================== ACTIONS ==================
  const updateLocalStatus = (id, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
    );
  };

  const handleApprove = async (id) => {
    try {
      setActionLoadingId(id);
      const response = await axios.patch(
        "http://localhost:1100/booking/approve",
        null,
        { params: { id } }
      );
      if (response.data.success) updateLocalStatus(id, "approved");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to approve booking");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this booking?")) return;

    try {
      setActionLoadingId(id);
      const response = await axios.patch(
        "http://localhost:1100/booking/reject",
        null,
        { params: { id } }
      );
      if (response.data.success) updateLocalStatus(id, "rejected");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to reject booking");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCheckIn = async (id) => {
    try {
      setActionLoadingId(id);
      const response = await axios.patch(
        "http://localhost:1100/booking/checkin",
        null,
        { params: { id } }
      );
      if (response.data.success) updateLocalStatus(id, "checkIn");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to check in");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCheckOut = async (id) => {
    try {
      setActionLoadingId(id);
      const response = await axios.patch(
        "http://localhost:1100/booking/checkout",
        null,
        { params: { id } }
      );
      if (response.data.success) updateLocalStatus(id, "checkOut");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to check out");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ================== HELPERS ==================
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadgeStyle = (status) => {
    const base = {
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "capitalize",
      display: "inline-block",
    };

    switch (status) {
      case "pending":
        return { ...base, background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.3)" };
      case "approved":
        return { ...base, background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", border: "1px solid rgba(59, 130, 246, 0.3)" };
      case "checkIn":
        return { ...base, background: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)" };
      case "checkOut":
        return { ...base, background: "rgba(107, 114, 128, 0.15)", color: "#9ca3af", border: "1px solid rgba(107, 114, 128, 0.3)" };
      case "rejected":
      case "cancelled":
        return { ...base, background: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.3)" };
      default:
        return { ...base, background: "#334155", color: "#f8fafc" };
    }
  };

  const tabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "checkIn", label: "Checked In" },
    { key: "checkOut", label: "Checked Out" },
    { key: "rejected", label: "Rejected" },
  ];

  const filteredBookings =
    activeTab === "all"
      ? bookings
      : bookings.filter((b) => b.status === activeTab);

  if (!currentUser) {
    return (
      <div style={{ padding: "40px", color: "#f8fafc", textAlign: "center" }}>
        <h2>Please Login</h2>
        <p style={{ color: "#94a3b8" }}>You need to be logged in as a hotel manager to view bookings.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 32px", color: "#f8fafc", fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      {/* Title & Count */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>Booking Management</h2>
          <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>
            {myHotel?.hotelname ? `${myHotel.hotelname}` : "Manage reservations"}
          </p>
        </div>
        <span style={{ background: "#1e293b", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", border: "1px solid #334155", color: "#38bdf8" }}>
          {filteredBookings.length} booking(s)
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px", borderBottom: "1px solid #1e293b", paddingBottom: "12px" }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                backgroundColor: isActive ? "#2563eb" : "#1e293b",
                color: isActive ? "#ffffff" : "#94a3b8",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Bookings List */}
      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading bookings...</p>
      ) : filteredBookings.length === 0 ? (
        <div style={{ background: "#1e293b", padding: "32px", borderRadius: "12px", textAlign: "center", color: "#94a3b8", border: "1px solid #334155" }}>
          <p style={{ margin: 0 }}>No bookings found for this filter.</p>
        </div>
      ) : (
        <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {/* Header inside Card */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", color: "#f8fafc" }}>
                    {booking.userId?.name || "Guest"}
                  </h3>

                </div>
                <span style={getStatusBadgeStyle(booking.status)}>
                  {booking.status === "checkIn" ? "Checked In" : booking.status === "checkOut" ? "Checked Out" : booking.status}
                </span>
              </div>

              {/* Room & Dates Info */}
              <div style={{ backgroundColor: "#0f172a", borderRadius: "8px", padding: "14px 16px", marginBottom: "16px", border: "1px solid #1e293b" }}>
                <p style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#38bdf8" }}>
                  Room #{booking.roomId?.roomNumber || "N/A"} · {booking.roomId?.roomType || "Standard"}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
                  <div>
                    <span style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "2px" }}>Check In</span>
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>{formatDate(booking.startDate)}</span>
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "2px" }}>Check Out</span>
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>{formatDate(booking.endDate)}</span>
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "2px" }}>Amount</span>
                    <span style={{ fontSize: "15px", fontWeight: "700", color: "#10b981" }}>₹{booking.price}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", alignItems: "center" }}>
                {booking.status === "pending" && (
                  <>
                    <button
                      disabled={actionLoadingId === booking._id}
                      onClick={() => handleApprove(booking._id)}
                      style={{
                        padding: "8px 18px",
                        backgroundColor: "#10b981",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Approve
                    </button>
                    <button
                      disabled={actionLoadingId === booking._id}
                      onClick={() => handleReject(booking._id)}
                      style={{
                        padding: "8px 18px",
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}

                {booking.status === "approved" && (
                  <button
                    disabled={actionLoadingId === booking._id}
                    onClick={() => handleCheckIn(booking._id)}
                    style={{
                      padding: "8px 18px",
                      backgroundColor: "#3b82f6",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    Check In
                  </button>
                )}

                {booking.status === "checkIn" && (
                  <button
                    disabled={actionLoadingId === booking._id}
                    onClick={() => handleCheckOut(booking._id)}
                    style={{
                      padding: "8px 18px",
                      backgroundColor: "#6b7280",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    Check Out
                  </button>
                )}

                {["checkOut", "rejected", "cancelled"].includes(booking.status) && (
                  <span style={{ fontSize: "13px", color: "#64748b", fontStyle: "italic" }}>
                    No actions available
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingManagement;