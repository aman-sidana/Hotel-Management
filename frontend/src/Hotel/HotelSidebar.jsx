import React from "react";

function HotelSidebar({ activetab, SetActivetab }) {
  return (
    <div className="sidebar" style={{ width: "220px", minHeight: "100vh", backgroundColor: "#1e293b", color: "#fff", padding: "20px" }}>
      <h3 style={{ color: "#38bdf8", marginBottom: "25px" }}>Hotel Admin Panel</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

        <button
          className={activetab === "room" ? "active" : ""}
          onClick={() => SetActivetab("room")}
          style={{
            padding: "10px",
            textAlign: "left",
            backgroundColor: activetab === "room" ? "#0d6efd" : "transparent",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: activetab === "room" ? "bold" : "normal"
          }}
        >
          🛏️ Room Management
        </button>

        <button
          className={activetab === "booking" ? "active" : ""}
          onClick={() => SetActivetab("booking")}
          style={{
            padding: "10px",
            textAlign: "left",
            backgroundColor: activetab === "booking" ? "#0d6efd" : "transparent",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: activetab === "booking" ? "bold" : "normal"
          }}
        >
          📅 Booking Management
        </button>
      </div>
    </div>
  );
}

export default HotelSidebar;