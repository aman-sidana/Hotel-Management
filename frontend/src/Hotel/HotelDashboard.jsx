import React, { useState } from "react";
import HotelSidebar from "./HotelSidebar";
import HotelRoomManagement from "./HotelRoomManagement";
import BookingManagement from "./BookingManagement";

function HotelDashboard() {
  const [activetab, SetActivetab] = useState("room");

  return (
    <div className="dashboard-layout">
      <HotelSidebar activetab={activetab} SetActivetab={SetActivetab} />
      <main className="dashboard-main">
        {activetab === "room" && <HotelRoomManagement />}
        {activetab === "booking" && <BookingManagement />}
      </main>
    </div>
  );
}

export default HotelDashboard;