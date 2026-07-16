import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import StateManagement from "./StateManagent"; // Make sure file name matches your import
import DistrictManagement from "./DistrictManagement";
import CityManagement from "./CityManagement";
// import "./styles.css"; // Don't forget to import the CSS file!
import HotelManagement from "./HotelManagement";

function Home() {
  const loggedInUser = JSON.parse(localStorage.getItem("currentuser"));
  const [activetab, SetActivetab] = useState("state");
  const navigate = useNavigate();

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
        <button className="btn btn-danger" onClick={logoutuser}>Logout</button>
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
            {activetab === "hotel" && <HotelManagement/>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;