import React from "react";

function Sidebar({ activetab, SetActivetab }) {
  return (
    <div className="sidebar">
      <button
        className={activetab === "state" ? "active" : ""}
        onClick={() => SetActivetab("state")}
      >
        Manage State
      </button>

      <button
        className={activetab === "district" ? "active" : ""}
        onClick={() => SetActivetab("district")}
      >
        Manage District
      </button>

      <button
        className={activetab === "city" ? "active" : ""}
        onClick={() => SetActivetab("city")}
      >
        Manage City
      </button>

      <button
        className={activetab === "hotel" ? "active" : ""}
        onClick={() => SetActivetab("hotel")}
      >
        All Hotels
      </button>
    </div>
  );
}

export default Sidebar;