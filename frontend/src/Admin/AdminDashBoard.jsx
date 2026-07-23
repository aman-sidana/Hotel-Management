import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import CouponManagement from "./CouponManagement";
import AdminHotelManagement from "./AdminHotelManagement";
import AdminBookings from "./AdminBookings";

function AdminDashBoard() {
  const [activetab, SetActivetab] = useState("hotel");

  return (
    <div className="dashboard-layout">
      <AdminSidebar activetab={activetab} SetActivetab={SetActivetab} />
      <main className="dashboard-main">
        {activetab === "coupon" && <CouponManagement />}
        {activetab === "hotel" && <AdminHotelManagement />}
        {activetab === "bookings" && <AdminBookings />}
      </main>
    </div>
  );
}

export default AdminDashBoard;