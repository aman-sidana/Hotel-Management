import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


function HotelRoomManagement() {
  const navigate = useNavigate();

  // Logged-in hotel account (a UserModel doc with role "hotel").
  // Its HotelDetails record is linked only by matching email, not by _id.
  const currentUser = JSON.parse(localStorage.getItem("currentuser") || "null");

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tab State: "active" or "inactive"
  const [activeTab, setActiveTab] = useState("active");

  // Search and Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("numberAsc");

  // View Details Modal State
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);

      const [roomsRes, hotelsRes] = await Promise.all([
        axios.get("http://localhost:1100/room/getallrooms"),
        axios.get("http://localhost:1100/hotel/allhotels"),
      ]);

      const allRooms = roomsRes.data || [];
      const allHotels = hotelsRes.data || [];

      // Find the HotelDetails doc matching this logged-in account's email
      const myHotel = currentUser?.email
        ? allHotels.find(
            (h) => h.hotelemail?.toLowerCase() === currentUser.email.toLowerCase()
          )
        : null;

      // Only keep rooms that belong to that hotel
      const ownRooms = myHotel
        ? allRooms.filter(
            (room) =>
              room.hotelId === myHotel._id || room.hotelId?._id === myHotel._id
          )
        : [];

      setRooms(ownRooms);
    } catch (error) {
      console.log("Error fetching rooms:", error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Soft Delete (Deactivate)
  const softDeleteRoom = async (id) => {
    try {
      await axios.patch(`http://localhost:1100/room/softdelete?id=${id}`);
      fetchRooms();
    } catch (error) {
      console.log("Error deactivating room:", error);
    }
  };

  // Restore (Activate)
  const restoreRoom = async (id) => {
    try {
      await axios.patch(`http://localhost:1100/room/restore?id=${id}`);
      fetchRooms();
    } catch (error) {
      console.log("Error activating room:", error);
    }
  };

  // Delete Permanently
  const deleteRoom = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this room permanently?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:1100/room/delete?id=${id}`);
      fetchRooms();
    } catch (error) {
      console.log("Error deleting room:", error);
    }
  };

  // 1. Filter by Active / Inactive Tab
  const tabFilteredRooms = rooms.filter((room) => {
    if (activeTab === "active") {
      return room.isActive === true;
    } else {
      return room.isActive === false;
    }
  });

  // 2. Search Filter (by Room Number, Room Type, or Hotel Name)
  const searchedRooms = tabFilteredRooms.filter((room) => {
    const q = searchQuery.toLowerCase();
    const roomNum = room.roomNumber ? room.roomNumber.toString().toLowerCase() : "";
    const type = room.roomType ? room.roomType.toLowerCase() : "";
    const hotel = room.hotelId?.hotelname ? room.hotelId.hotelname.toLowerCase() : "";

    return roomNum.includes(q) || type.includes(q) || hotel.includes(q);
  });

  // 3. Sorting Logic
  const displayedRooms = [...searchedRooms].sort((a, b) => {
    if (sortBy === "numberAsc") {
      return Number(a.roomNumber) - Number(b.roomNumber);
    } else if (sortBy === "numberDesc") {
      return Number(b.roomNumber) - Number(a.roomNumber);
    } else if (sortBy === "priceLow") {
      return Number(a.pricePerNight) - Number(b.pricePerNight);
    } else if (sortBy === "priceHigh") {
      return Number(b.pricePerNight) - Number(a.pricePerNight);
    }
    return 0;
  });

  return (
    <div className="app-page app-page--split" style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>


      {/* Main Content Area */}
      <div style={{ flex: 1, padding: "25px", fontFamily: "Arial, sans-serif" }}>

        {/* Top Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ margin: "0 0 5px 0", color: "#1e293b" }}>Room Management</h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
              View and manage all active and inactive hotel rooms.
            </p>
          </div>

          {/* Add Room Button (Navigates to /roomform) */}
          <button
            onClick={() => navigate("/roomform")}
            style={{
              padding: "10px 18px",
              backgroundColor: "#0d6efd",
              color: "#ffffff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            + Add Room
          </button>
        </div>

        {/* Filter Controls: Active/Inactive Tabs, Sort, and Search */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "20px" }}>
          {/* Active Tab Button */}
          <button
            onClick={() => setActiveTab("active")}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              backgroundColor: activeTab === "active" ? "#0d6efd" : "#e2e8f0",
              color: activeTab === "active" ? "#ffffff" : "#000000",
            }}
          >
            Active Rooms
          </button>

          {/* Inactive Tab Button */}
          <button
            onClick={() => setActiveTab("inactive")}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              backgroundColor: activeTab === "inactive" ? "#0d6efd" : "#e2e8f0",
              color: activeTab === "inactive" ? "#ffffff" : "#000000",
            }}
          >
            Inactive Rooms
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ marginLeft: "auto", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
          >
            <option value="numberAsc">Room Number (Low to High)</option>
            <option value="numberDesc">Room Number (High to Low)</option>
            <option value="priceLow">Price (Low to High)</option>
            <option value="priceHigh">Price (High to Low)</option>
          </select>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search room number, type, hotel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: "8px", width: "230px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
          />
        </div>

        {/* Room Cards Grid */}
        {loading ? (
          <p>Loading rooms list...</p>
        ) : displayedRooms.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666", padding: "40px", backgroundColor: "#fff", borderRadius: "8px" }}>
            No {activeTab === "active" ? "Active" : "Inactive"} rooms found.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {displayedRooms.map((room) => (
              <div
                key={room._id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  backgroundColor: room.isActive ? "#ffffff" : "#f1f5f9",
                }}
              >
                {/* Room Image Card Header */}
                <div style={{ height: "150px", backgroundColor: "#cbd5e1", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  {room.images && room.images.length > 0 ? (
                    <img src={room.images[0]} alt="Room Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ color: "#64748b", fontSize: "14px" }}>No Photo Uploaded</span>
                  )}
                </div>

                {/* Card Content Details */}
                <div style={{ padding: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>
                      Room #{room.roomNumber}
                    </h3>
                    <span
                      style={{
                        fontSize: "12px",
                        backgroundColor: "#dcfce7",
                        color: "#15803d",
                        padding: "3px 8px",
                        borderRadius: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      {room.roomType}
                    </span>
                  </div>

                  <p style={{ margin: "5px 0", fontSize: "14px", color: "#334155" }}>
                    <strong>Hotel:</strong> {room.hotelId?.hotelname || "N/A"}
                  </p>
                  <p style={{ margin: "5px 0", fontSize: "14px", color: "#334155" }}>
                    <strong>Floor:</strong> {room.floor}
                  </p>
                  <p style={{ margin: "5px 0", fontSize: "14px", color: "#334155" }}>
                    <strong>Price:</strong> ₹{room.pricePerNight} / night
                  </p>
                  <p style={{ margin: "5px 0", fontSize: "14px", color: "#334155" }}>
                    <strong>Capacity:</strong> {room.capacity} Guest(s)
                  </p>

                  <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "12px 0" }} />

                  {/* Card Action Buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button
                        onClick={() => { setSelectedRoom(room); setShowModal(true); }}
                        style={{ flex: 1, padding: "6px", backgroundColor: "#0d6efd", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => navigate("/roomform", { state: { roomData: room } })}
                        style={{ flex: 1, padding: "6px", backgroundColor: "#ffc107", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}
                      >
                        Edit
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: "5px" }}>
                      {room.isActive ? (
                        <button
                          onClick={() => softDeleteRoom(room._id)}
                          style={{ flex: 1, padding: "6px", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => restoreRoom(room._id)}
                          style={{ flex: 1, padding: "6px", backgroundColor: "#198754", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
                        >
                          Activate
                        </button>
                      )}

                      <button
                        onClick={() => deleteRoom(room._id)}
                        style={{ flex: 1, padding: "6px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Room View Modal */}
        {showModal && selectedRoom && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", maxWidth: "500px", width: "90%", maxHeight: "80vh", overflowY: "auto" }}>
              <h2>Room #{selectedRoom.roomNumber} Details</h2>

              <p><strong>Hotel Name:</strong> {selectedRoom.hotelId?.hotelname || "N/A"}</p>
              <p><strong>Room Type:</strong> {selectedRoom.roomType}</p>
              <p><strong>Floor:</strong> {selectedRoom.floor}</p>
              <p><strong>Price Per Night:</strong> ₹{selectedRoom.pricePerNight}</p>
              <p><strong>Capacity:</strong> {selectedRoom.capacity} Guests</p>

              <h4>Enabled Facilities:</h4>
              <ul>
                {selectedRoom.ac && <li>Air Conditioner (AC)</li>}
                {selectedRoom.wifi && <li>Free WiFi</li>}
                {selectedRoom.tv && <li>Television (TV)</li>}
                {selectedRoom.attachedBathroom && <li>Attached Bathroom</li>}
                {selectedRoom.bathtub && <li>Bathtub</li>}
                {selectedRoom.geyser && <li>Geyser / Water Heater</li>}
                {selectedRoom.balcony && <li>Balcony</li>}
                {selectedRoom.miniFridge && <li>Mini Fridge</li>}
                {selectedRoom.roomService && <li>Room Service</li>}
              </ul>

              <button
                onClick={() => { setShowModal(false); setSelectedRoom(null); }}
                style={{ marginTop: "15px", padding: "8px 16px", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default HotelRoomManagement;