import React from "react";
import { useNavigate } from "react-router-dom";
import UseTheme from "./custom hooks/Usetheme";

import SuperAdminDashboard from "./SuperAdmin/SuperAdminDashboard";
import AdminDashBoard from "./Admin/AdminDashBoard";
import UserDashBoard from "./User/UserDashBoard";
import HotelDashboard from "./Hotel/HotelDashboard";

function Home() {
  const { theme, changeTheme } = UseTheme();
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(localStorage.getItem("currentuser")) || {};

  function logoutuser() {
    localStorage.removeItem("token");
    localStorage.removeItem("currentuser");
    navigate("/");
  }

  const renderDashboardByRole = () => {
    switch (loggedInUser?.role) {
      case "superadmin":
        return <SuperAdminDashboard />;
      case "admin":
        return <AdminDashBoard />;
      case "hotel":
        return <HotelDashboard />;
      case "user":
        return <UserDashBoard />;
      default:
        return <div className="p-4">Unauthorized or unknown role.</div>;
    }
  };

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h2>Welcome {loggedInUser?.name || "Guest"}</h2>
          <p>{loggedInUser?.role}</p>
        </div>
        <div>
          <button className="btn btn-danger" onClick={logoutuser}>
            Logout
          </button>
          <button onClick={changeTheme} className="theme-toggle-btn">
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>

          <button
            className="btn btn-warning"
            style={{ marginLeft: "10px" }}
            onClick={() => navigate("/resetpassword")}
          >
            Reset Password
          </button>
        </div>
      </header>

      {renderDashboardByRole()}
    </div>
  );
}

export default Home;