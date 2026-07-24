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

  useEffect(() => { getHotels(); }, []);

  const getHotels = async () => {
    try {
      const result = await axios.get("http://localhost:1100/hotel/allhotels");
      setHotels(result.data || []);
    } catch (error) { console.log(error); setHotels([]); }
  };

  const viewHotel = async (id) => {
    try {
      const result = await axios.get(`http://localhost:1100/hotel/viewhotel?id=${id}`);
      setSelectedHotel(result.data.hotel);
      setShowModal(true);
    } catch (error) { console.log(error); }
  };

  const approveHotel = async (id) => {
    try {
      await axios.patch(`http://localhost:1100/hotel/approvehotel?id=${id}`);
      getHotels();
    } catch (error) { console.log(error); }
  };

  const openRejectModal = (id) => {
    setRejectingId(id); setRejectReason(""); setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) { alert("Please provide a reason for rejection."); return; }
    try {
      await axios.patch(`http://localhost:1100/hotel/rejecthotel?id=${rejectingId}`, { description: rejectReason });
      setShowRejectModal(false); setRejectingId(null); setRejectReason(""); getHotels();
    } catch (error) { console.log(error); }
  };

  const softDeleteHotel = async (id) => {
    try { await axios.patch(`http://localhost:1100/hotel/softdeletehotel?id=${id}`); getHotels(); } catch (error) { console.log(error); }
  };

  const restoreHotel = async (id) => {
    try { await axios.patch(`http://localhost:1100/hotel/restorehotel?id=${id}`); getHotels(); } catch (error) { console.log(error); }
  };

  const deleteHotel = async (id) => {
    if (!window.confirm("Delete this hotel?")) return;
    try { await axios.delete(`http://localhost:1100/hotel/deletehotel?id=${id}`); getHotels(); } catch (error) { console.log(error); }
  };

  const filteredHotels = hotels.filter((hotel) => {
    switch (activeTab) {
      case "pending": return hotel.status === "pending" && hotel.isActive;
      case "approved": return hotel.status === "approved" && hotel.isActive;
      case "rejected": return hotel.status === "rejected" && hotel.isActive;
      case "inactive": return hotel.isActive === false;
      case "active": return hotel.isActive === true;
      default: return true;
    }
  });

  const searchedHotels = filteredHotels.filter((item) => {
    const q = searchQuery.toLowerCase();
    const hotelMatch = item.hotelname ? item.hotelname.toLowerCase().includes(q) : false;
    const ownerName = item.adminId?.adminname || item.ownername || "";
    const ownerMatch = ownerName ? ownerName.toLowerCase().includes(q) : false;
    const phoneVal = item.hotelphone || item.ownerphone || "";
    const phoneMatch = phoneVal ? phoneVal.toString().toLowerCase().includes(q) : false;
    return hotelMatch || ownerMatch || phoneMatch;
  });

  const displayedHotels = [...searchedHotels].sort((a, b) => {
    const aOwner = a.adminId?.adminname || a.ownername || "";
    const bOwner = b.adminId?.adminname || b.ownername || "";
    if (sortBy === "hotelAsc") return (a.hotelname || "").localeCompare(b.hotelname || "");
    else if (sortBy === "hotelDesc") return (b.hotelname || "").localeCompare(a.hotelname || "");
    else if (sortBy === "ownerAsc") return aOwner.localeCompare(bOwner);
    else if (sortBy === "ownerDesc") return bOwner.localeCompare(aOwner);
    return 0;
  });

  const tabs = [
    { id: "pending", label: "🕐 Pending" },
    { id: "approved", label: "✅ Approved" },
    { id: "rejected", label: "❌ Rejected" },
    { id: "active", label: "🟢 Active" },
    { id: "inactive", label: "⭕ Inactive" },
  ];

  return (
    <div className="management-module">
      <div className="flex items-center justify-between mb-5">
        <h2 className="mb-0">Hotel Management</h2>
        <button
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all duration-200"
          onClick={() => navigate("/hotelform")}
        >
          + Add Hotel
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab.id ? "bg-blue-600 text-white" : "btn-action-secondary"}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3 items-center flex-wrap mb-5">
        <select className="form-select ml-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="hotelAsc">Hotel (A - Z)</option>
          <option value="hotelDesc">Hotel (Z - A)</option>
          <option value="ownerAsc">Owner / Admin (A - Z)</option>
          <option value="ownerDesc">Owner / Admin (Z - A)</option>
        </select>
        <input type="text" className="form-input w-44" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="table-container">
        <table className="hotel-table">
          <thead>
            <tr>
              <th>Hotel</th>
              <th>Owner / Admin</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedHotels.map((hotel) => (
              <tr key={hotel._id}>
                <td className="font-semibold">{hotel.hotelname}</td>
                <td>{hotel.adminId?.adminname || hotel.ownername || hotel.hotelname}</td>
                <td>{hotel.hotelphone || hotel.ownerphone || "N/A"}</td>
                <td>
                  <div className="flex gap-2 flex-wrap">
                    {activeTab === "pending" && (
                      <>
                        <button className="btn-action-primary" onClick={() => viewHotel(hotel._id)}>View</button>
                        <button className="btn-action-success" onClick={() => approveHotel(hotel._id)}>Approve</button>
                        <button className="btn-action-danger" onClick={() => openRejectModal(hotel._id)}>Reject</button>
                      </>
                    )}
                    {(activeTab === "approved" || activeTab === "active") && (
                      <>
                        <button className="btn-action-warning" onClick={() => softDeleteHotel(hotel._id)}>Make Inactive</button>
                        <button className="btn-action-danger" onClick={() => deleteHotel(hotel._id)}>Delete</button>
                      </>
                    )}
                    {activeTab === "rejected" && (
                      <>
                        <button className="btn-action-success" onClick={() => approveHotel(hotel._id)}>Approve</button>
                        <button className="btn-action-danger" onClick={() => deleteHotel(hotel._id)}>Delete</button>
                      </>
                    )}
                    {activeTab === "inactive" && (
                      <>
                        <button className="btn-action-success" onClick={() => restoreHotel(hotel._id)}>Make Active</button>
                        <button className="btn-action-danger" onClick={() => deleteHotel(hotel._id)}>Delete</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {displayedHotels.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-8 text-slate-400 dark:text-slate-500">No Hotels Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedHotel && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setSelectedHotel(null); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Hotel Details</h2>
            <div className="flex flex-col gap-2">
              {[
                ["Hotel Name", selectedHotel.hotelname],
                ["Owner", selectedHotel.adminId?.adminname || "N/A"],
                ["Email", selectedHotel.hotelemail || "N/A"],
                ["Phone", selectedHotel.hotelphone || "N/A"],
                ["State", selectedHotel.stateId?.stateName || "N/A"],
                ["District", selectedHotel.districtId?.districtName || "N/A"],
                ["City", selectedHotel.cityId?.cityName || "N/A"],
                ["Address", selectedHotel.hoteladdress || "N/A"],
                ["Total Rooms", selectedHotel.totalrooms || 0],
                ["Total Staff", selectedHotel.totalstaff || 0],
                ["Request ID", selectedHotel.hotelRequestId || "N/A"],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2 text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[100px]">{label}:</span>
                  <span className="text-slate-600 dark:text-slate-400">{value}</span>
                </div>
              ))}
              <div className="flex gap-2 text-sm items-center">
                <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[100px]">Status:</span>
                <span className={`status-badge ${selectedHotel.status === "approved" ? "approved" : selectedHotel.status === "rejected" ? "rejected" : "pending"}`}>
                  {selectedHotel.status}
                </span>
              </div>
              {selectedHotel.description && (
                <div className="flex gap-2 text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[100px]">Description:</span>
                  <span className="text-slate-600 dark:text-slate-400">{selectedHotel.description}</span>
                </div>
              )}
            </div>
            <button className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" onClick={() => { setShowModal(false); setSelectedHotel(null); }}>
              Close
            </button>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="modal-overlay" onClick={() => { setShowRejectModal(false); setRejectingId(null); setRejectReason(""); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Reject Hotel Request</h2>
            <p className="text-sm text-red-500 mb-3">Please provide a reason for rejecting this request:</p>
            <textarea
              className="form-textarea w-full min-h-[100px] resize-none"
              placeholder="Enter rejection details or reason here..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end mt-4">
              <button className="btn-action-danger" onClick={confirmReject}>Confirm Reject</button>
              <button className="btn-action-secondary" onClick={() => { setShowRejectModal(false); setRejectingId(null); setRejectReason(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HotelManagement;
