import React, { useState } from "react";
import Sidebar from "./Sidebar";
import StateManagement from "./StateManagent";
import DistrictManagement from "./DistrictManagement";
import CityManagement from "./CityManagement";
import HotelManagement from "./HotelManagement";
import AdminManagement from "./AdminManagement";
import AdminForm from "../Admin/AdminForm";

function SuperAdminDashboard() {
  const [activetab, setActivetab] = useState("state");

  return (
    <div className="main-container">
      <Sidebar activetab={activetab} SetActivetab={setActivetab} />
      <div className="content">
        {activetab === "adminform" && <AdminForm />}
        {activetab === "state" && <StateManagement />}
        {activetab === "district" && <DistrictManagement />}
        {activetab === "city" && <CityManagement />}
        {activetab === "admin" && <AdminManagement />}
        {activetab === "hotel" && <HotelManagement />}
      </div>
    </div>
  );
}

export default SuperAdminDashboard;