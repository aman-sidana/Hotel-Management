import React, { useState } from "react";
import HotelSidebar from "./HotelSidebar";
import HotelRoomManagement from "./HotelRoomManagement";

function HotelDashboard() {
  // Active tab state: defaults to "dashboard"
  const [activetab, SetActivetab] = useState("room");

  return (
    <div className="main-container" style={{ display: "flex", minHeight: "100vh" }}>
      <HotelSidebar activetab={activetab} SetActivetab={SetActivetab} />


        {activetab === "room" && <HotelRoomManagement />}
      
    </div>
  );
}

export default HotelDashboard;