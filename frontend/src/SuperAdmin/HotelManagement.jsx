import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function HotelManagement() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("hotelAsc");

  useEffect(() => {
    getHotels();
  }, []);

  const getHotels = async () => {
    try {
      const result = await axios.get("http://localhost:1100/hotel/allhotels");
      setHotels(result.data || []);
    } catch (error) {
      console.log(error);
      setHotels([]);
    }
  };

  const viewHotel = async (id) => {
    try {
      const result = await axios.get(
        `http://localhost:1100/hotel/viewhotel?id=${id}`
      );
      setSelectedHotel(result.data.hotel);
      setShowModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  const approveHotel = async (id) => {
    try {
      await axios.patch(`http://localhost:1100/hotel/approvehotel?id=${id}`);
      getHotels();
    } catch (error) {
      console.log(error);
    }
  };

  const openRejectModal = (id) => {
    setRejectingId(id);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    try {
      await axios.patch(`http://localhost:1100/hotel/rejecthotel?id=${rejectingId}`, {
        description: rejectReason
      });
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectReason("");
      getHotels();
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
    if (!window.confirm("Delete this hotel?")) return;
    try {
      await axios.delete(`http://localhost:1100/hotel/deletehotel?id=${id}`);
      getHotels();
    } catch (error) {
      console.log(error);
    }
  };

  // Filter hotels by active tab status
  const filteredHotels = hotels.filter((hotel) => {
    switch (activeTab) {
      case "pending":
        return hotel.status === "pending" && hotel.isActive;
      case "approved":
        return hotel.status === "approved" && hotel.isActive;
      case "rejected":
        return hotel.status === "rejected" && hotel.isActive;
      case "inactive":
        return hotel.isActive === false;
      case "active":
        return hotel.isActive === true;
      default:
        return true;
    }
  });

  // Search filtering logic (Hotel Name, Admin/Owner Name, Phone, Email)
  const searchedHotels = filteredHotels.filter((item) => {
    const q = searchQuery.toLowerCase();
    const hotelMatch = item.hotelname ? item.hotelname.toLowerCase().includes(q) : false;
    const ownerName = item.adminId?.adminname || item.ownername || "";
    const ownerMatch = ownerName ? ownerName.toLowerCase().includes(q) : false;
    const phoneVal = item.hotelphone || item.ownerphone || "";
    const phoneMatch = phoneVal ? phoneVal.toString().toLowerCase().includes(q) : false;
    return hotelMatch || ownerMatch || phoneMatch;
  });

  // Sorting logic based on dropdown selection
  const displayedHotels = [...searchedHotels].sort((a, b) => {
    const aOwner = a.adminId?.adminname || a.ownername || "";
    const bOwner = b.adminId?.adminname || b.ownername || "";

    if (sortBy === "hotelAsc") {
      return (a.hotelname || "").localeCompare(b.hotelname || "");
    } else if (sortBy === "hotelDesc") {
      return (b.hotelname || "").localeCompare(a.hotelname || "");
    } else if (sortBy === "ownerAsc") {
      return aOwner.localeCompare(bOwner);
    } else if (sortBy === "ownerDesc") {
      return bOwner.localeCompare(aOwner);
    }
    return 0;
  });

  return (
    <div className="hotel-management-container">
      <h2>Hotel Management</h2>

      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Requests
        </button>

        <button
          className={`tab-btn ${activeTab === "approved" ? "active" : ""}`}
          onClick={() => setActiveTab("approved")}
        >
          Approved Hotels
        </button>

        <button
          className={`tab-btn ${activeTab === "rejected" ? "active" : ""}`}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected Hotels
        </button>

        <button
          className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Active Hotels
        </button>

        <button
          className={`tab-btn ${activeTab === "inactive" ? "active" : ""}`}
          onClick={() => setActiveTab("inactive")}
        >
          Inactive Hotels
        </button>
        <button onClick={() => navigate("/hotelform")}> Add Hotel</button>
      </div>

      {/* Filter controls, Sort dropdown, and Search Input */}
      <div className="filter-buttons" style={{ margin: "20px 0", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        {/* Sort Dropdown */}
        <select
          className="form-input"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ marginLeft: "auto", width: "180px", cursor: "pointer" }}
        >
          <option value="hotelAsc">Hotel (A - Z)</option>
          <option value="hotelDesc">Hotel (Z - A)</option>
          <option value="ownerAsc">Owner / Admin (A - Z)</option>
          <option value="ownerDesc">Owner / Admin (Z - A)</option>
        </select>

        {/* Search Input */}
        <input
          type="text"
          className="form-input"
          placeholder="Search..."
          style={{ width: "180px" }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <table className="hotel-table">
        <thead>
          <tr>
            <th>Hotel</th>
            <th>Owner / Admin</th>
            <th>Phone</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {displayedHotels.map((hotel) => (
            <tr key={hotel._id}>
              <td>{hotel.hotelname}</td>

              {/* ✅ FIXED: Fallbacks so owner/admin display is never empty */}
              <td>
                {hotel.adminId?.adminname || hotel.ownername || hotel.hotelname}
              </td>

              {/* ✅ FIXED: Fallback for phone */}
              <td>
                {hotel.hotelphone || hotel.ownerphone || "N/A"}
              </td>

              <td>
                <div className="action-buttons">
                  {activeTab === "pending" && (
                    <div>
                      <button className="btn-action btn-approve" onClick={() => viewHotel(hotel._id)}>
                        View Details
                      </button>
                      <button className="btn-action btn-approve" onClick={() => approveHotel(hotel._id)}>
                        Approve
                      </button>
                      <button className="btn-action btn-reject" onClick={() => openRejectModal(hotel._id)}>
                        Reject
                      </button>
                    </div>
                  )}

                  {(activeTab === "approved" || activeTab === "active") && (
                    <div>
                      <button className="btn-action btn-warning" onClick={() => softDeleteHotel(hotel._id)}>
                        Make Inactive
                      </button>
                      <button className="btn-action btn-delete" onClick={() => deleteHotel(hotel._id)}>
                        Delete
                      </button>
                    </div>
                  )}

                  {activeTab === "rejected" && (
                    <div>
                      <button className="btn-action btn-approve" onClick={() => approveHotel(hotel._id)}>
                        Approve
                      </button>
                      <button className="btn-action btn-delete" onClick={() => deleteHotel(hotel._id)}>
                        Delete
                      </button>
                    </div>
                  )}

                  {(activeTab === "softdelete" || activeTab === "inactive") && (
                    <div>
                      <button className="btn-action btn-restore" onClick={() => restoreHotel(hotel._id)}>
                        Make Active
                      </button>
                      <button className="btn-action btn-delete" onClick={() => deleteHotel(hotel._id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {displayedHotels.length === 0 && (
            <tr>
              <td colSpan="4" align="center" style={{ padding: "30px", color: "#7f8c8d" }}>
                No Hotels Found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Hotel Details Modal */}
      {showModal && selectedHotel && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Hotel Details</h2>

            <p><strong>Hotel Name:</strong> {selectedHotel.hotelname}</p>
            <p><strong>Owner :</strong> {selectedHotel.adminId?.adminname || "N/A"}</p>
            <p><strong>Email:</strong> {selectedHotel.hotelemail || "N/A"}</p>
            <p><strong>Phone:</strong> {selectedHotel.hotelphone || "N/A"}</p>
            <p><strong>State:</strong> {selectedHotel.stateId?.stateName || "N/A"}</p>
            <p><strong>District:</strong> {selectedHotel.districtId?.districtName || "N/A"}</p>
            <p><strong>City:</strong> {selectedHotel.cityId?.cityName || "N/A"}</p>
            <p><strong>Address:</strong> {selectedHotel.hoteladdress || "N/A"}</p>
            <p><strong>Total Rooms:</strong> {selectedHotel.totalrooms || 0}</p>
            <p><strong>Total Staff:</strong> {selectedHotel.totalstaff || 0}</p>
            <p><strong>Request ID:</strong> {selectedHotel.hotelRequestId || "N/A"}</p>

            <p>
              <strong>Status:</strong>
              <span
                style={{
                  color:
                    selectedHotel.status === "approved"
                      ? "green"
                      : selectedHotel.status === "rejected"
                        ? "red"
                        : "orange",
                  marginLeft: "10px"
                }}
              >
                {selectedHotel.status}
              </span>
            </p>

            {selectedHotel.description && (
              <p>
                <strong>Description:</strong>{" "}
                {selectedHotel.description}
              </p>
            )}

            <button
              onClick={() => {
                setShowModal(false);
                setSelectedHotel(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Reject Hotel Request</h2>
            <p style={{ color: "#e74c3c" }}>Please provide a reason for rejecting this request:</p>

            <textarea
              className="form-textarea"
              placeholder="Enter rejection details or reason here..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: "100%", height: "120px", marginTop: "10px", padding: "10px", boxSizing: "border-box" }}
            />

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                className="btn-action btn-reject"
                onClick={confirmReject}
              >
                Confirm Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingId(null);
                  setRejectReason("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HotelManagement;