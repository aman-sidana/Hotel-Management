import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminHotelManagement() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Active Tab State (active / inactive)
  const [activeTab, setActiveTab] = useState("active");

  // Search & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("hotelAsc"); // Options: hotelAsc, hotelDesc, ownerAsc, ownerDesc

  // Modal States
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getHotels();
  }, []);

  const getHotels = async () => {
    try {
      setLoading(true);
      const result = await axios.get("http://localhost:1100/hotel/allhotels");
      setHotels(result.data || []);
    } catch (error) {
      console.log(error);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const viewHotel = async (id) => {
    try {
      const result = await axios.get(`http://localhost:1100/hotel/viewhotel?id=${id}`);
      setSelectedHotel(result.data.hotel);
      setShowModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  const softDeleteHotel = async (id) => {
    try {
      await axios.patch(`http://localhost:1100/hotel/softdeletehotel?id=${id}`);
      getHotels();
    } catch (error) {
      console.log(error);
    }
  };

  const restoreHotel = async (id) => {
    try {
      await axios.patch(`http://localhost:1100/hotel/restorehotel?id=${id}`);
      getHotels();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteHotel = async (id) => {
    if (!window.confirm("Delete this hotel permanently?")) return;
    try {
      await axios.delete(`http://localhost:1100/hotel/deletehotel?id=${id}`);
      getHotels();
    } catch (error) {
      console.log(error);
    }
  };

  // Helper function to extract a valid banner image URL
  const getDisplayImage = (hotel) => {
    const imgs = hotel?.images || hotel?.hotelImages;
    if (Array.isArray(imgs) && imgs.length > 0) {
      return imgs[0];
    }
    if (typeof imgs === "string" && imgs.trim() !== "") {
      return imgs;
    }
    return null;
  };

  // 1. Filter by Active / Inactive Tab
  const tabFilteredHotels = hotels.filter((hotel) => {
    if (activeTab === "active") return hotel.isActive === true;
    if (activeTab === "inactive") return hotel.isActive === false;
    return true;
  });

  // 2. Search Filter (Hotel Name, Owner/Admin Name, or Phone)
  const searchedHotels = tabFilteredHotels.filter((item) => {
    const q = searchQuery.toLowerCase();
    const hotelMatch = item.hotelname ? item.hotelname.toLowerCase().includes(q) : false;
    const ownerName = item.adminId?.adminname || item.ownername || "";
    const ownerMatch = ownerName ? ownerName.toLowerCase().includes(q) : false;
    const phoneVal = item.hotelphone || item.ownerphone || "";
    const phoneMatch = phoneVal ? phoneVal.toString().toLowerCase().includes(q) : false;
    return hotelMatch || ownerMatch || phoneMatch;
  });

  // 3. Sort Logic
  const displayedHotels = [...searchedHotels].sort((a, b) => {
    const ownerA = a.adminId?.adminname || a.ownername || "";
    const ownerB = b.adminId?.adminname || b.ownername || "";

    if (sortBy === "hotelAsc") {
      return (a.hotelname || "").localeCompare(b.hotelname || "");
    } else if (sortBy === "hotelDesc") {
      return (b.hotelname || "").localeCompare(a.hotelname || "");
    } else if (sortBy === "ownerAsc") {
      return ownerA.localeCompare(ownerB);
    } else if (sortBy === "ownerDesc") {
      return ownerB.localeCompare(ownerA);
    }
    return 0;
  });

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header with Add Hotel Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Hotel Configuration Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/hotelform")}
          style={{ padding: "10px 15px", background: "#0d6efd", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
        >
          + Add Hotel
        </button>
      </div>

      {/* Tabs, Sort Dropdown & Search Controls */}
      <div style={{ margin: "20px 0", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("active")}
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            background: activeTab === "active" ? "#0d6efd" : "#e2e8f0",
            color: activeTab === "active" ? "#fff" : "#000",
            fontWeight: "bold",
          }}
        >
          Active Hotels
        </button>
        <button
          onClick={() => setActiveTab("inactive")}
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            background: activeTab === "inactive" ? "#0d6efd" : "#e2e8f0",
            color: activeTab === "inactive" ? "#fff" : "#000",
            fontWeight: "bold",
          }}
        >
          Inactive Hotels
        </button>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ marginLeft: "auto", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", cursor: "pointer" }}
        >
          <option value="hotelAsc">Hotel (A - Z)</option>
          <option value="hotelDesc">Hotel (Z - A)</option>
          <option value="ownerAsc">Owner / Admin (A - Z)</option>
          <option value="ownerDesc">Owner / Admin (Z - A)</option>
        </select>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search Hotel or Owner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "8px", width: "200px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>

      {/* Hotel Cards Grid */}
      {loading ? (
        <p>Loading hotel records...</p>
      ) : displayedHotels.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666", padding: "30px" }}>
          No {activeTab === "active" ? "Active" : "Inactive"} hotels found.
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {displayedHotels.map((hotel) => {
            const imageUrl = getDisplayImage(hotel);

            return (
              <div
                key={hotel._id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  background: hotel.isActive ? "#fff" : "#f1f5f9",
                }}
              >
                {/* Hotel Image Banner - Updated Logic */}
                <div style={{ height: "160px", background: "#cbd5e1", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={hotel.hotelname || "Hotel Banner"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ color: "#64748b", fontSize: "14px" }}>No Image Uploaded</span>
                  )}
                </div>

                {/* Card Details */}
                <div style={{ padding: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", color: "#1e293b" }}>{hotel.hotelname}</h3>
                    <span
                      style={{
                        fontSize: "12px",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontWeight: "bold",
                        background: hotel.isActive ? "#dcfce7" : "#fee2e2",
                        color: hotel.isActive ? "#15803d" : "#b91c1c",
                      }}
                    >
                      {hotel.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p style={{ margin: "6px 0", fontSize: "14px" }}>
                    <strong>Owner / Admin:</strong> {hotel.adminId?.adminname || hotel.ownername || "N/A"}
                  </p>
                  <p style={{ margin: "6px 0", fontSize: "14px" }}>
                    <strong>Phone:</strong> {hotel.hotelphone || hotel.ownerphone || "N/A"}
                  </p>
                  <p style={{ margin: "6px 0", fontSize: "14px" }}>
                    <strong>Total Rooms:</strong> {hotel.totalrooms || 0}
                  </p>
                  <p style={{ margin: "6px 0", fontSize: "12px", color: "#64748b" }}>
                    <strong>Status Tag:</strong> {hotel.status || "Pending"}
                  </p>

                  <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "12px 0" }} />

                  {/* Card Action Buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button
                        onClick={() => viewHotel(hotel._id)}
                        style={{ flex: 1, padding: "6px", background: "#0d6efd", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigate("/hotelform", { state: { hotelData: hotel } })}
                        style={{ flex: 1, padding: "6px", background: "#ffc107", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}
                      >
                        Edit
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: "5px" }}>
                      {hotel.isActive ? (
                        <button
                          onClick={() => softDeleteHotel(hotel._id)}
                          style={{ flex: 1, padding: "6px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => restoreHotel(hotel._id)}
                          style={{ flex: 1, padding: "6px", background: "#198754", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => deleteHotel(hotel._id)}
                        style={{ flex: 1, padding: "6px", background: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Details Modal */}
      {showModal && selectedHotel && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", maxWidth: "500px", width: "90%", maxHeight: "80vh", overflowY: "auto" }}>
            <h2>Hotel Details</h2>

            {/* Display banner image in Modal if available */}
            {getDisplayImage(selectedHotel) && (
              <img
                src={getDisplayImage(selectedHotel)}
                alt="Hotel Large Preview"
                style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "6px", marginBottom: "15px" }}
              />
            )}

            <p><strong>Hotel Name:</strong> {selectedHotel.hotelname}</p>
            <p><strong>Owner / Admin:</strong> {selectedHotel.adminId?.adminname || selectedHotel.ownername || "N/A"}</p>
            <p><strong>Email:</strong> {selectedHotel.hotelemail || selectedHotel.email || "N/A"}</p>
            <p><strong>Phone:</strong> {selectedHotel.hotelphone || selectedHotel.ownerphone || "N/A"}</p>
            <p><strong>Address:</strong> {selectedHotel.hoteladdress || "N/A"}</p>
            <p><strong>State:</strong> {selectedHotel.stateId?.stateName || "N/A"}</p>
            <p><strong>District:</strong> {selectedHotel.districtId?.districtName || "N/A"}</p>
            <p><strong>City:</strong> {selectedHotel.cityId?.cityName || "N/A"}</p>
            <p><strong>Total Rooms:</strong> {selectedHotel.totalrooms || 0}</p>
            <p><strong>Total Staff:</strong> {selectedHotel.totalstaff || 0}</p>
            <p><strong>Approval Status:</strong> {selectedHotel.status || "Pending"}</p>

            <button
              onClick={() => {
                setShowModal(false);
                setSelectedHotel(null);
              }}
              style={{ marginTop: "15px", padding: "8px 16px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminHotelManagement;