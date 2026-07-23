import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function HotelRoomManagement() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentuser") || "null");

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("numberAsc");

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const [roomsRes, hotelsRes] = await Promise.all([
        axios.get("http://localhost:1100/room/getallrooms"),
        axios.get("http://localhost:1100/hotel/allhotels"),
      ]);

      const allRooms = roomsRes.data || [];
      const allHotels = hotelsRes.data || [];

      const myHotel = currentUser?.email
        ? allHotels.find((h) => h.hotelemail?.toLowerCase() === currentUser.email.toLowerCase())
        : null;

      const ownRooms = myHotel
        ? allRooms.filter((room) => room.hotelId === myHotel._id || room.hotelId?._id === myHotel._id)
        : [];

      setRooms(ownRooms);
    } catch (error) {
      console.log("Error fetching rooms:", error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const softDeleteRoom = async (id) => {
    try { await axios.patch(`http://localhost:1100/room/softdelete?id=${id}`); fetchRooms(); } catch (error) { console.log(error); }
  };

  const restoreRoom = async (id) => {
    try { await axios.patch(`http://localhost:1100/room/restore?id=${id}`); fetchRooms(); } catch (error) { console.log(error); }
  };

  const deleteRoom = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room permanently?")) return;
    try { await axios.delete(`http://localhost:1100/room/delete?id=${id}`); fetchRooms(); } catch (error) { console.log(error); }
  };

  const tabFilteredRooms = rooms.filter((room) =>
    activeTab === "active" ? room.isActive === true : room.isActive === false
  );

  const searchedRooms = tabFilteredRooms.filter((room) => {
    const q = searchQuery.toLowerCase();
    const roomNum = room.roomNumber ? room.roomNumber.toString().toLowerCase() : "";
    const type = room.roomType ? room.roomType.toLowerCase() : "";
    const hotel = room.hotelId?.hotelname ? room.hotelId.hotelname.toLowerCase() : "";
    return roomNum.includes(q) || type.includes(q) || hotel.includes(q);
  });

  const displayedRooms = [...searchedRooms].sort((a, b) => {
    if (sortBy === "numberAsc") return Number(a.roomNumber) - Number(b.roomNumber);
    else if (sortBy === "numberDesc") return Number(b.roomNumber) - Number(a.roomNumber);
    else if (sortBy === "priceLow") return Number(a.pricePerNight) - Number(b.pricePerNight);
    else if (sortBy === "priceHigh") return Number(b.pricePerNight) - Number(a.pricePerNight);
    return 0;
  });

  const facilityList = (room) => {
    const all = [
      { key: "ac", label: "❄️ AC" },
      { key: "wifi", label: "📶 WiFi" },
      { key: "tv", label: "📺 TV" },
      { key: "attachedBathroom", label: "🚿 Bathroom" },
      { key: "bathtub", label: "🛁 Bathtub" },
      { key: "geyser", label: "🔥 Geyser" },
      { key: "balcony", label: "🌿 Balcony" },
      { key: "miniFridge", label: "🧊 Mini Fridge" },
      { key: "roomService", label: "🍽️ Room Service" },
    ];
    return all.filter((f) => room[f.key]);
  };

  return (
    <div className="management-module">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-sky-400">
            Room Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and manage all active and inactive hotel rooms.</p>
        </div>
        <button
          onClick={() => navigate("/roomform")}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all duration-200"
        >
          + Add Room
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap mb-6">
        <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "active" ? "bg-blue-600 text-white" : "btn-action-secondary"}`} onClick={() => setActiveTab("active")}>Active Rooms</button>
        <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "inactive" ? "bg-blue-600 text-white" : "btn-action-secondary"}`} onClick={() => setActiveTab("inactive")}>Inactive Rooms</button>
        <select className="form-select ml-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="numberAsc">Room # (Low to High)</option>
          <option value="numberDesc">Room # (High to Low)</option>
          <option value="priceLow">Price (Low to High)</option>
          <option value="priceHigh">Price (High to Low)</option>
        </select>
        <input type="text" className="form-input w-52" placeholder="Search room number, type, hotel..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {/* Room Cards */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">Loading rooms...</div>
      ) : displayedRooms.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          No {activeTab === "active" ? "Active" : "Inactive"} rooms found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedRooms.map((room) => (
            <div
              key={room._id}
              className={`admin-card ${!room.isActive ? "inactive" : ""}`}
            >
              {/* Room Image */}
              <div className="h-40 bg-slate-100 dark:bg-slate-700 overflow-hidden">
                {room.images && room.images.length > 0 ? (
                  <img src={room.images[0]} alt="Room Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm">No Photo</div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base text-slate-800 dark:text-white">Room #{room.roomNumber}</h3>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {room.roomType}
                  </span>
                </div>
                {[
                  ["Hotel", room.hotelId?.hotelname || "N/A"],
                  ["Floor", room.floor],
                  ["Price", `₹${room.pricePerNight} / night`],
                  ["Capacity", `${room.capacity} Guests`],
                ].map(([label, value]) => (
                  <p key={label} className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{label}:</span> {value}
                  </p>
                ))}

                <hr className="my-3 border-slate-100 dark:border-slate-700" />

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button className="flex-1 btn-action-primary text-center" onClick={() => { setSelectedRoom(room); setShowModal(true); }}>View</button>
                    <button className="flex-1 btn-action-warning text-center" onClick={() => navigate("/roomform", { state: { roomData: room } })}>Edit</button>
                  </div>
                  <div className="flex gap-2">
                    {room.isActive ? (
                      <button className="flex-1 btn-action-secondary text-center" onClick={() => softDeleteRoom(room._id)}>Deactivate</button>
                    ) : (
                      <button className="flex-1 btn-action-success text-center" onClick={() => restoreRoom(room._id)}>Activate</button>
                    )}
                    <button className="flex-1 btn-action-danger text-center" onClick={() => deleteRoom(room._id)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Room Details Modal */}
      {showModal && selectedRoom && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setSelectedRoom(null); }}>
          <div className="modal-box max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Room #{selectedRoom.roomNumber} Details</h2>

            <div className="flex flex-col gap-2 mb-4">
              {[
                ["Hotel Name", selectedRoom.hotelId?.hotelname || "N/A"],
                ["Room Type", selectedRoom.roomType],
                ["Floor", selectedRoom.floor],
                ["Price Per Night", `₹${selectedRoom.pricePerNight}`],
                ["Capacity", `${selectedRoom.capacity} Guests`],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2 text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[120px]">{label}:</span>
                  <span className="text-slate-600 dark:text-slate-400">{value}</span>
                </div>
              ))}
            </div>

            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">Enabled Facilities:</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {facilityList(selectedRoom).length > 0
                ? facilityList(selectedRoom).map((f) => (
                  <span key={f.key} className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {f.label}
                  </span>
                ))
                : <span className="text-xs text-slate-400">None enabled</span>
              }
            </div>

            <button className="w-full py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" onClick={() => { setShowModal(false); setSelectedRoom(null); }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HotelRoomManagement;