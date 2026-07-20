import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import CouponManagement from "./CouponManagement";
import AdminHotelManagement from "./AdminHotelManagement";

function AdminDashBoard() {
  const [activetab, SetActivetab] = useState("hotel");

  return (
    <div className="main-container">
      <AdminSidebar activetab={activetab} SetActivetab={SetActivetab} />
      <div className="content">
        {activetab === "coupon" && <CouponManagement />}
        {activetab === "hotel" && <AdminHotelManagement />}
      </div>
    </div>
  );
}

export default AdminDashBoard;