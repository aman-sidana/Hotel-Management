import React, { useEffect, useState } from "react";
import axios from "axios";

function HotelManagement() {
  const [hotels, setHotels] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    getHotels();
  }, []);

  // ==========================
  // Get All Hotels
  // ==========================

  const getHotels = async () => {
    try {
      const result = await axios.get(
        "http://localhost:1100/hotel/allhotels"
      );

      setHotels(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================
  // Approve Hotel
  // ==========================

  const approveHotel = async (id) => {
    try {
      await axios.patch(
        `http://localhost:1100/hotel/approvehotel?id=${id}`
      );

      getHotels();
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================
  // Reject Hotel
  // ==========================

  const rejectHotel = async (id) => {
    try {
      await axios.patch(
        `http://localhost:1100/hotel/rejecthotel?id=${id}`
      );

      getHotels();
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================
  // Soft Delete
  // ==========================

  const softDeleteHotel = async (id) => {
    try {
      await axios.patch(
        `http://localhost:1100/hotel/softdeletehotel?id=${id}`
      );

      getHotels();
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================
  // Restore
  // ==========================

  const restoreHotel = async (id) => {
    try {
      await axios.patch(
        `http://localhost:1100/hotel/restorehotel?id=${id}`
      );

      getHotels();
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================
  // Delete Hotel
  // ==========================

  const deleteHotel = async (id) => {
    if (!window.confirm("Delete this hotel?")) return;

    try {
      await axios.delete(
        `http://localhost:1100/hotel/deletehotel?id=${id}`
      );

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
    <div style={{ padding: "20px" }}>
      <h2>Hotel Management</h2>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("pending")}>
          Pending Requests
        </button>

        <button onClick={() => setActiveTab("approved")}>
          Approved Hotels
        </button>

        <button onClick={() => setActiveTab("rejected")}>
          Rejected Hotels
        </button>

        <button onClick={() => setActiveTab("softdelete")}>
          Soft Deleted Hotels
        </button>
      </div>

      <table border="1" cellPadding="10" width="100%">
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
                {/* Pending */}
                {activeTab === "pending" && (
                  <>
                    <button
                      onClick={() => approveHotel(hotel._id)}
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => rejectHotel(hotel._id)}
                    >
                      Reject
                    </button>
                  </>
                )}

                {/* Approved */}
                {activeTab === "approved" && (
                  <>
                    {/* <button
                      onClick={() => {
                        // Navigate to update page or open modal
                      }}
                    >
                      Update
                    </button> */}

                    <button
                      onClick={() => softDeleteHotel(hotel._id)}
                    >
                      Soft Delete
                    </button>

                    <button
                      onClick={() => deleteHotel(hotel._id)}
                    >
                      Delete
                    </button>
                  </>
                )}

                {/* Rejected */}
                {activeTab === "rejected" && (
                  <>
                    <button
                      onClick={() => approveHotel(hotel._id)}
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => deleteHotel(hotel._id)}
                    >
                      Delete
                    </button>
                  </>
                )}

                {/* Soft Deleted */}
                {activeTab === "softdelete" && (
                  <>
                    <button
                      onClick={() => restoreHotel(hotel._id)}
                    >
                      Restore
                    </button>

                    <button
                      onClick={() => deleteHotel(hotel._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}

          {filteredHotels.length === 0 && (
            <tr>
              <td colSpan="12" align="center">
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