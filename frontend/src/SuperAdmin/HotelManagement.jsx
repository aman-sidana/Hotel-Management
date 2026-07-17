import React, { useEffect, useState } from "react";
import axios from "axios";

function HotelManagement() {
  const [hotels, setHotels] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ CHANGE: Added state variables for handling the Rejection Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    getHotels();
  }, []);

  const getHotels = async () => {
    try {
      const result = await axios.get("http://localhost:1100/hotel/allhotels");
      setHotels(result.data);
    } catch (error) {
      console.log(error);
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

  // ✅ CHANGE: Updated rejectHotel function to open the Reject Modal first
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
        description: rejectReason // Sending the reason to be saved in the 'description' field
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
      </div>

      <table className="hotel-table">
        <thead>
          <tr>
            <th>Hotel</th>
            <th>Owner</th>
            <th>Phone</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredHotels.map((hotel) => (
            <tr key={hotel._id}>
              <td>{hotel.hotelname}</td>
              <td>{hotel.ownername}</td>
              <td>{hotel.ownerphone}</td>
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
                      {/* ✅ CHANGE: Updated Reject button to trigger the Modal instead of the direct call */}
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

          {filteredHotels.length === 0 && (
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
            <p><strong>Owner:</strong> {selectedHotel.ownername}</p>
            <p><strong>Email:</strong> {selectedHotel.email}</p>
            <p><strong>Phone:</strong> {selectedHotel.ownerphone}</p>
            <p><strong>State:</strong> {selectedHotel.stateId?.stateName}</p>
            <p><strong>District:</strong> {selectedHotel.districtId?.districtName}</p>
            <p><strong>City:</strong> {selectedHotel.cityId?.cityName}</p>
            <p><strong>Address:</strong> {selectedHotel.hoteladdress}</p>
            <p><strong>Total Rooms:</strong> {selectedHotel.totalrooms}</p>
            <p><strong>Request ID:</strong> {selectedHotel.hotelRequestId}</p>

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

      {/* ✅ CHANGE: Added Rejection Reason Modal */}
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