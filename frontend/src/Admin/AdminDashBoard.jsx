import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import CouponManagement from "./CouponManagement";

function AdminDashBoard() {
  const [activetab, SetActivetab] = useState("coupon");

  return (
    <div className="main-container">
      <AdminSidebar activetab={activetab} SetActivetab={SetActivetab} />
      <div className="content">
        {activetab === "coupon" && <CouponManagement />}
      </div>
    </div>
  );
}

export default AdminDashBoard;