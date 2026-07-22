import React from "react";

function Sidebar({ activetab, SetActivetab }) {
  const menuItems = [
    { id: "state", label: "Manage State" },
    { id: "district", label: "Manage District" },
    { id: "city", label: "Manage City" },
    { id: "admin", label: "Admin's" },
    { id: "hotel", label: "Hotel's" },
  ];

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <span className="sidebar-title">Menu</span>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-btn ${activetab === item.id ? "active" : ""}`}
            onClick={() => SetActivetab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;