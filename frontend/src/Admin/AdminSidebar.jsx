import React from "react";
import { useNavigate } from "react-router-dom";
import UseTheme from "../custom hooks/Usetheme";

function AdminSidebar({ activetab, SetActivetab }) {
  const navigate = useNavigate();
  const { theme, changeTheme } = UseTheme();
  const loggedInUser = JSON.parse(localStorage.getItem("currentuser")) || {};

  const menuItems = [
    { id: "hotel", label: "🏨 Manage Hotel" },
    { id: "coupon", label: "🎟️ Manage Coupon" },
    { id: "bookings", label: "📋 See Bookings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentuser");
    navigate("/");
  };

  return (
    <aside className="sidebar-container flex flex-col justify-between">
      <div>
        {/* Brand & User Header */}
        <div className="sidebar-header border-b border-slate-700/70 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              🏨 StayEasy
            </h2>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Admin Portal
            </span>
          </div>
          {(loggedInUser.name || loggedInUser.username) && (
            <div className="flex items-center gap-2.5 mt-3 pt-2.5 border-t border-slate-700/50">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/20 flex-shrink-0">
                {(loggedInUser.name || loggedInUser.username || "A")[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-100 truncate">
                  {loggedInUser.name || loggedInUser.username}
                </p>
                <p className="text-[10px] text-slate-400 truncate capitalize">
                  {loggedInUser.role || "Admin"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav p-3 flex flex-col gap-1.5">
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
      </div>

      {/* Sidebar Footer Actions */}
      <div className="p-3.5 border-t border-slate-700/70 flex flex-col gap-2.5 bg-slate-900/40">
        <button
          onClick={() => navigate("/resetpassword")}
          className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold
            bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30
            transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
        >
          <span>🔑</span> Reset Password
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={changeTheme}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold
              bg-slate-700/80 hover:bg-slate-600 text-slate-200 border border-slate-600/50
              transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95"
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <button
            onClick={handleLogout}
            className="py-2 px-3 rounded-xl text-xs font-semibold
              bg-red-500/15 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30
              transition-all duration-200 flex items-center justify-center gap-1 active:scale-95"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;