import React, { useEffect, useState } from "react";
import axios from "axios";

function HotelManagement() {
  const [hotels, setHotels] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

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

  const approveHotel = async (id) => {
    try {
      await axios.patch(`http://localhost:1100/hotel/approvehotel?id=${id}`);
      getHotels();
    } catch (error) {
      console.log(error);
    }
  };

  const rejectHotel = async (id) => {
    try {
      await axios.patch(`http://localhost:1100/hotel/rejecthotel?id=${id}`);
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
      case "softdelete":
        return hotel.isActive === false;
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
          className={`tab-btn ${activeTab === "softdelete" ? "active" : ""}`} 
          onClick={() => setActiveTab("softdelete")}
        >
          Soft Deleted Hotels
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
                  {/* Pending */}
                  {activeTab === "pending" && (
                    <>
                      <button className="btn-action btn-approve" onClick={() => approveHotel(hotel._id)}>
                        Approve
                      </button>
                      <button className="btn-action btn-reject" onClick={() => rejectHotel(hotel._id)}>
                        Reject
                      </button>
                    </>
                  )}

                  {/* Approved */}
                  {activeTab === "approved" && (
                    <>
                      <button className="btn-action btn-warning" onClick={() => softDeleteHotel(hotel._id)}>
                        Soft Delete
                      </button>
                      <button className="btn-action btn-delete" onClick={() => deleteHotel(hotel._id)}>
                        Delete
                      </button>
                    </>
                  )}

                  {/* Rejected */}
                  {activeTab === "rejected" && (
                    <>
                      <button className="btn-action btn-approve" onClick={() => approveHotel(hotel._id)}>
                        Approve
                      </button>
                      <button className="btn-action btn-delete" onClick={() => deleteHotel(hotel._id)}>
                        Delete
                      </button>
                    </>
                  )}

                  {/* Soft Deleted */}
                  {activeTab === "softdelete" && (
                    <>
                      <button className="btn-action btn-restore" onClick={() => restoreHotel(hotel._id)}>
                        Restore
                      </button>
                      <button className="btn-action btn-delete" onClick={() => deleteHotel(hotel._id)}>
                        Delete
                      </button>
                    </>
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
    </div>
  );
}

export default HotelManagement;