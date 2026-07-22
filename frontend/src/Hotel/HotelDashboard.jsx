import React, { useState } from "react";
import HotelSidebar from "./HotelSidebar";
import HotelRoomManagement from "./HotelRoomManagement";
import BookingManagement from "./BookingManagement";

function HotelDashboard() {
  // Active tab state: defaults to "room"
  const [activetab, SetActivetab] = useState("room");

  return (
    <div className="main-container" style={{ display: "flex", minHeight: "100vh" }}>
      <HotelSidebar activetab={activetab} SetActivetab={SetActivetab} />

      <div style={{ flex: 1 }}>
        {activetab === "room" && <HotelRoomManagement />}
        {activetab === "booking" && <BookingManagement />}
      </div>
    </div>
  );
}

export default HotelDashboard;