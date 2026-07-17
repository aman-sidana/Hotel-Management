import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UseTheme from "../custom hooks/Usetheme";
import Sidebar from "./Sidebar";
import StateManagement from "./StateManagent";
import DistrictManagement from "./DistrictManagement";
import CityManagement from "./CityManagement";
import HotelManagement from "./HotelManagement";
import AdminDashBoard from "../Admin/AdminDashBoard";
import UserDashBoard from "../User/UserDashBoard";

function Home() {
  const { theme, changeTheme } = UseTheme();
  const loggedInUser = JSON.parse(localStorage.getItem("currentuser"));
  const navigate = useNavigate();

  const [activetab, SetActivetab] = useState(() => {
    if (loggedInUser?.role === "hotelAdmin") return "hoteladmin";
    if (loggedInUser?.role === "user") return "user";
    return "state";
  });

  function logoutuser() {
    localStorage.removeItem("token");
    localStorage.removeItem("currentuser");
    navigate("/");
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h2>Welcome {loggedInUser?.name}</h2>
          <p>{loggedInUser?.role}</p>
        </div>
        <div>
          <button className="btn btn-danger" onClick={logoutuser}>Logout</button>
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

      {loggedInUser?.role === "superadmin" && (
        <div className="main-container">
          <Sidebar
            activetab={activetab}
            SetActivetab={SetActivetab}
          />
          <div className="content">
            {activetab === "state" && <StateManagement />}
            {activetab === "district" && <DistrictManagement />}
            {activetab === "city" && <CityManagement />}
            {activetab === "hotel" && <HotelManagement />}
          </div>
        </div>
      )}

      {loggedInUser?.role === "hotelAdmin" && (
        <div className="main-container">
          <div className="content">
            <AdminDashBoard />
          </div>
        </div>
      )}

      {loggedInUser?.role === "user" && (
        <div className="main-container">
          <div className="content">
            <UserDashBoard />
          </div>
        </div>
      )}

    </div>
  );
}

export default Home;