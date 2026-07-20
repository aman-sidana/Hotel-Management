import React from "react";

function AdminSidebar({ activetab, SetActivetab }) {
  return (
    <div className="sidebar">
      <button
        className={activetab === "coupon" ? "active" : ""}
        onClick={() => SetActivetab("coupon")}
      >
        Manage Coupon
      </button>
    </div>
  );
}

export default AdminSidebar;