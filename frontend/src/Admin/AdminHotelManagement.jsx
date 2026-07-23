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
    if (Array.isArray(imgs) && imgs.length > 0) return imgs[0];
    if (typeof imgs === "string" && imgs.trim() !== "") return imgs;
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
    if (sortBy === "hotelAsc") return (a.hotelname || "").localeCompare(b.hotelname || "");
    else if (sortBy === "hotelDesc") return (b.hotelname || "").localeCompare(a.hotelname || "");
    else if (sortBy === "ownerAsc") return ownerA.localeCompare(ownerB);
    else if (sortBy === "ownerDesc") return ownerB.localeCompare(ownerA);
    return 0;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-sky-400">
          Hotel Configuration Management
        </h2>
        <button
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all duration-200"
          onClick={() => navigate("/hotelform")}
        >
          + Add Hotel
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap mb-6">
        <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "active" ? "bg-blue-600 text-white" : "btn-action-secondary"}`} onClick={() => setActiveTab("active")}>Active Hotels</button>
        <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "inactive" ? "bg-blue-600 text-white" : "btn-action-secondary"}`} onClick={() => setActiveTab("inactive")}>Inactive Hotels</button>
        <select className="form-select ml-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="hotelAsc">Hotel (A - Z)</option>
          <option value="hotelDesc">Hotel (Z - A)</option>
          <option value="ownerAsc">Owner / Admin (A - Z)</option>
          <option value="ownerDesc">Owner / Admin (Z - A)</option>
        </select>
        <input type="text" className="form-input w-52" placeholder="Search Hotel or Owner..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">Loading hotel records...</div>
      ) : displayedHotels.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">No {activeTab === "active" ? "Active" : "Inactive"} hotels found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedHotels.map((hotel) => {
            const imageUrl = getDisplayImage(hotel);
            return (
              <div key={hotel._id} className={`admin-card ${!hotel.isActive ? "inactive" : ""}`}>
                <div className="h-44 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                  {imageUrl ? (
                    <img src={imageUrl} alt={hotel.hotelname || "Hotel"} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 text-sm">No Image Uploaded</span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="font-bold text-base text-slate-800 dark:text-white truncate">{hotel.hotelname}</h3>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${hotel.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                      {hotel.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {[
                    ["Owner / Admin", hotel.adminId?.adminname || hotel.ownername || "N/A"],
                    ["Phone", hotel.hotelphone || hotel.ownerphone || "N/A"],
                    ["Total Rooms", hotel.totalrooms || 0],
                    ["Status Tag", hotel.status || "Pending"],
                  ].map(([label, value]) => (
                    <p key={label} className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{label}:</span> {value}
                    </p>
                  ))}

                  <hr className="my-3 border-slate-100 dark:border-slate-700" />

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button className="flex-1 btn-action-primary text-center" onClick={() => viewHotel(hotel._id)}>View Details</button>
                      <button className="flex-1 btn-action-warning text-center" onClick={() => navigate("/hotelform", { state: { hotelData: hotel } })}>Edit</button>
                    </div>
                    <div className="flex gap-2">
                      {hotel.isActive ? (
                        <button className="flex-1 btn-action-secondary text-center" onClick={() => softDeleteHotel(hotel._id)}>Deactivate</button>
                      ) : (
                        <button className="flex-1 btn-action-success text-center" onClick={() => restoreHotel(hotel._id)}>Activate</button>
                      )}
                      <button className="flex-1 btn-action-danger text-center" onClick={() => deleteHotel(hotel._id)}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedHotel && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setSelectedHotel(null); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Hotel Details</h2>

            {getDisplayImage(selectedHotel) && (
              <img src={getDisplayImage(selectedHotel)} alt="Hotel" className="w-full h-44 object-cover rounded-xl mb-4" />
            )}

            <div className="flex flex-col gap-2">
              {[
                ["Hotel Name", selectedHotel.hotelname],
                ["Owner / Admin", selectedHotel.adminId?.adminname || selectedHotel.ownername || "N/A"],
                ["Email", selectedHotel.hotelemail || selectedHotel.email || "N/A"],
                ["Phone", selectedHotel.hotelphone || selectedHotel.ownerphone || "N/A"],
                ["Address", selectedHotel.hoteladdress || "N/A"],
                ["State", selectedHotel.stateId?.stateName || "N/A"],
                ["District", selectedHotel.districtId?.districtName || "N/A"],
                ["City", selectedHotel.cityId?.cityName || "N/A"],
                ["Total Rooms", selectedHotel.totalrooms || 0],
                ["Total Staff", selectedHotel.totalstaff || 0],
                ["Approval Status", selectedHotel.status || "Pending"],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2 text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[120px]">{label}:</span>
                  <span className="text-slate-600 dark:text-slate-400">{value}</span>
                </div>
              ))}
            </div>

            <button
              className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold
                bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200
                hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              onClick={() => { setShowModal(false); setSelectedHotel(null); }}
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