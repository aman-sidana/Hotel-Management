import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import CouponManagement from "./CouponManagement";
import AdminHotelManagement from "./AdminHotelManagement";
import AdminBookings from "./AdminBookings";

function AdminDashBoard() {
  const [activetab, SetActivetab] = useState("hotel");

  return (
    <div className="main-container">
      <AdminSidebar activetab={activetab} SetActivetab={SetActivetab} />
      <div className="content">
        {activetab === "coupon" && <CouponManagement />}
        {activetab === "hotel" && <AdminHotelManagement />}
        {activetab === "bookings" && <AdminBookings />}
      </div>
    </div>
  );
}

export default AdminDashBoard;