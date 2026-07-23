import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminHotelManagement() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("active");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("hotelAsc");

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

  const tabFilteredHotels = hotels.filter((hotel) => {
    if (activeTab === "active") return hotel.isActive === true;
    if (activeTab === "inactive") return hotel.isActive === false;
    return true;
  });

  const searchedHotels = tabFilteredHotels.filter((item) => {
    const q = searchQuery.toLowerCase();
    const hotelMatch = item.hotelname ? item.hotelname.toLowerCase().includes(q) : false;
    const ownerName = item.adminId?.adminname || item.ownername || "";
    const ownerMatch = ownerName ? ownerName.toLowerCase().includes(q) : false;
    const phoneVal = item.hotelphone || item.ownerphone || "";
    const phoneMatch = phoneVal ? phoneVal.toString().toLowerCase().includes(q) : false;
    return hotelMatch || ownerMatch || phoneMatch;
  });

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
    <div className="app-page app-page--management" style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Hotel Configuration Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/hotelform")}
        >
          + Add Hotel
        </button>
      </div>

      <div className="filter-buttons">
        <button
          className={`btn ${activeTab === "active" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("active")}
        >
          Active Hotels
        </button>
        <button
          className={`btn ${activeTab === "inactive" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("inactive")}
        >
          Inactive Hotels
        </button>

        <select
          className="form-input"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ marginLeft: "auto", width: "200px" }}
        >
          <option value="hotelAsc">Hotel (A - Z)</option>
          <option value="hotelDesc">Hotel (Z - A)</option>
          <option value="ownerAsc">Owner / Admin (A - Z)</option>
          <option value="ownerDesc">Owner / Admin (Z - A)</option>
        </select>

        <input
          type="text"
          className="form-input"
          placeholder="Search Hotel or Owner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "200px" }}
        />
      </div>

      {loading ? (
        <p>Loading hotel records...</p>
      ) : displayedHotels.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "30px" }}>
          No {activeTab === "active" ? "Active" : "Inactive"} hotels found.
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {displayedHotels.map((hotel) => {
            const imageUrl = getDisplayImage(hotel);

            return (
              <div key={hotel._id} className={`admin-card ${!hotel.isActive ? "inactive" : ""}`}>
                <div className="admin-card-image">
                  {imageUrl ? (
                    <img src={imageUrl} alt={hotel.hotelname || "Hotel Banner"} />
                  ) : (
                    <span>No Image Uploaded</span>
                  )}
                </div>

                <div className="admin-card-body">
                  <div className="admin-card-header">
                    <h3>{hotel.hotelname}</h3>
                    <span className={`admin-badge ${hotel.isActive ? "success" : "danger"}`}>
                      {hotel.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="admin-card-detail">
                    <strong>Owner / Admin:</strong> {hotel.adminId?.adminname || hotel.ownername || "N/A"}
                  </p>
                  <p className="admin-card-detail">
                    <strong>Phone:</strong> {hotel.hotelphone || hotel.ownerphone || "N/A"}
                  </p>
                  <p className="admin-card-detail">
                    <strong>Total Rooms:</strong> {hotel.totalrooms || 0}
                  </p>
                  <p className="admin-card-detail">
                    <strong>Status Tag:</strong> {hotel.status || "Pending"}
                  </p>

                  <hr className="admin-card-divider" />

                  <div className="admin-card-actions">
                    <div className="admin-card-actions-row">
                      <button className="admin-action-btn view" onClick={() => viewHotel(hotel._id)}>
                        View Details
                      </button>
                      <button
                        className="admin-action-btn edit"
                        onClick={() => navigate("/hotelform", { state: { hotelData: hotel } })}
                      >
                        Edit
                      </button>
                    </div>

                    <div className="admin-card-actions-row">
                      {hotel.isActive ? (
                        <button className="admin-action-btn deactivate" onClick={() => softDeleteHotel(hotel._id)}>
                          Deactivate
                        </button>
                      ) : (
                        <button className="admin-action-btn activate" onClick={() => restoreHotel(hotel._id)}>
                          Activate
                        </button>
                      )}
                      <button className="admin-action-btn delete" onClick={() => deleteHotel(hotel._id)}>
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

      {showModal && selectedHotel && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Hotel Details</h2>

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
              className="btn btn-secondary"
              onClick={() => {
                setShowModal(false);
                setSelectedHotel(null);
              }}
              style={{ marginTop: "15px" }}
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