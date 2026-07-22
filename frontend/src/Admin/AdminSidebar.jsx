import React from "react";

function AdminSidebar({ activetab, SetActivetab }) {
    return (
        <div className="sidebar">
            <button
                className={activetab === "hotel" ? "active" : ""}
                onClick={() => SetActivetab("hotel")}
            >
                Manage Hotel
            </button>

            <button
                className={activetab === "coupon" ? "active" : ""}
                onClick={() => SetActivetab("coupon")}
            >
                Manage Coupon
            </button>
            <button
                className={activetab === "bookings" ? "active" : ""}
                onClick={() => SetActivetab("bookings")}
            >
                see bookings
            </button>
        </div>
    );
}

export default AdminSidebar;