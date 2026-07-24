import { useEffect, useState } from "react";
import axios from "axios";
import { gsap } from "gsap";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../genericComponents/Navbar";

function HotelRoom() {
  const location = useLocation();
  const navigate = useNavigate();

  const hotelData = location.state?.hotelData || null;
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewedRoom, setViewedRoom] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [totalNights, setTotalNights] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const [filters, setFilters] = useState({
    kingSizeBed: false, queenSizeBed: false, singleBed: false, doubleBed: false,
    ac: false, wifi: false, tv: false, geyser: false, miniFridge: false,
    bathtub: false, balcony: false, sofa: false, locker: false,
    roomService: false, laundryService: false, housekeeping: false,
  });

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: checked }));
  };

  const resetFilters = () => {
    setSearchQuery(""); setSortBy("default");
    setFilters({
      kingSizeBed: false, queenSizeBed: false, singleBed: false, doubleBed: false,
      ac: false, wifi: false, tv: false, geyser: false, miniFridge: false,
      bathtub: false, balcony: false, sofa: false, locker: false,
      roomService: false, laundryService: false, housekeeping: false,
    });
  };

  useEffect(() => {
    if (!hotelData?._id) return;
    async function loadHotelRooms() {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:1100/room/getallrooms");
        const activeHotelRooms = (res.data || []).filter(
          (room) => room.isActive === true &&
            (room.hotelId === hotelData._id || room.hotelId?._id === hotelData._id)
        );
        setRooms(activeHotelRooms);
      } catch (error) {
        console.log("Error loading rooms:", error); setRooms([]);
      } finally { setLoading(false); }
    }
    loadHotelRooms();
  }, [hotelData]);

  const filteredRooms = rooms
    .filter((room) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        room.roomNumber?.toString().includes(query) ||
        room.roomType?.toLowerCase().includes(query);
      if (!matchesQuery) return false;
      for (const [key, value] of Object.entries(filters)) {
        if (value && !room[key]) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "priceLowHigh") return a.pricePerNight - b.pricePerNight;
      if (sortBy === "priceHighLow") return b.pricePerNight - a.pricePerNight;
      if (sortBy === "roomAsc") return a.roomNumber - b.roomNumber;
      return 0;
    });

  useEffect(() => {
    if (!hotelData) return undefined;
    const contentEl = document.getElementById("hotel-room-content");
    if (!contentEl) return undefined;
    const context = gsap.context(() => {
      gsap.from(".user-selected-hotel, .user-section-title", {
        autoAlpha: 0, duration: 0.6, y: 15, stagger: 0.1, ease: "power2.out",
      });
    }, contentEl);
    return () => context.revert();
  }, [hotelData]);

  useEffect(() => {
    if (loading) return undefined;
    const roomsEl = document.getElementById("rooms-grid");
    if (!roomsEl || !roomsEl.children.length) return undefined;
    const context = gsap.context(() => {
      gsap.from(roomsEl.children, {
        autoAlpha: 0, duration: 0.5, y: 18, stagger: 0.05, ease: "power3.out",
        clearProps: "transform,opacity,visibility",
      });
    }, roomsEl);
    return () => context.revert();
  }, [loading, filteredRooms.length]);

  useEffect(() => {
    if (!selectedRoom || !startDate || !endDate) return;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const difference = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (difference <= 0) {
      setTotalNights(1); setTotalPrice(selectedRoom.pricePerNight);
    } else {
      setTotalNights(difference); setTotalPrice(difference * selectedRoom.pricePerNight);
    }
  }, [startDate, endDate, selectedRoom]);

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    setStartDate(today.toISOString().split("T")[0]);
    setEndDate(tomorrow.toISOString().split("T")[0]);
    setTotalNights(1); setTotalPrice(room.pricePerNight);
    setBookingSuccess(false); setCreatedBooking(null);
    setIsModalOpen(true);
  };
  const handleViewDetails = async (roomId) => {
    try {
      setViewLoading(true);
      setIsViewModalOpen(true);
      const res = await axios.get(`http://localhost:1100/room/viewbyone?id=${roomId}`);
      setViewedRoom(res.data);
    } catch (error) {
      console.log("Error fetching room details:", error);
      alert("Failed to load room details.");
      setIsViewModalOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewedRoom(null);
  };

  const amenityLabels = {
    ac: "❄️ AC", cooler: "🌀 Cooler", attachedBathroom: "🚻 Attached Bathroom",
    bathtub: "🛁 Bathtub", geyser: "🚿 Geyser", tv: "📺 TV", wifi: "📶 WiFi",
    telephone: "☎️ Telephone", miniFridge: "🧊 Mini Fridge", microwave: "📡 Microwave",
    electricKettle: "☕ Electric Kettle", sofa: "🛋️ Sofa", diningTable: "🍽️ Dining Table",
    wardrobe: "🚪 Wardrobe", balcony: "🌅 Balcony", locker: "🔐 Locker",
    smokeDetector: "🚨 Smoke Detector", fireExtinguisher: "🧯 Fire Extinguisher",
    roomService: "🍽️ Room Service", laundryService: "🧺 Laundry Service",
    housekeeping: "🧹 Housekeeping",
  };

  const bedLabels = {
    kingSizeBed: "King Size", queenSizeBed: "Queen Size",
    singleBed: "Single", doubleBed: "Double",
  };

  const closeModal = () => {
    setIsModalOpen(false); setSelectedRoom(null);
    setStartDate(""); setEndDate(""); setBookingSuccess(false);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem("currentuser"));
    if (!currentUser) { alert("Please login first."); return; }
    try {
      setSubmitting(true);
      const response = await axios.post("http://localhost:1100/booking/create", {
        userId: currentUser._id, hotelId: hotelData._id,
        roomId: selectedRoom._id, price: totalPrice, startDate, endDate,
      });
      if (response.data.success) {
        setCreatedBooking(response.data.booking); setBookingSuccess(true);
        setRooms((prevRooms) => prevRooms.filter((room) => room._id !== selectedRoom._id));
      }
    } catch (error) {
      console.log(error); alert(error.response?.data?.message || "Booking Failed");
    } finally { setSubmitting(false); }
  };

  if (!hotelData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="text-5xl mb-4">🏨</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">No Hotel Selected</h2>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all duration-200"
          >
            Back to Hotels
          </button>
        </div>
      </div>
    );
  }

  const filterCheckboxClass = "flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 w-full" id="hotel-room-content">
      <Navbar />

      <div className="w-full px-6 lg:px-8 py-4 bg-white/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold btn-action-secondary flex items-center gap-1.5"
            >
              ← Back to Hotels
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {hotelData.hotelname}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span>📍 {hotelData.cityId?.cityName || "City"}, {hotelData.stateId?.stateName || "State"}</span>
                <span>•</span>
                <span>🏠 {hotelData.hoteladdress}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              🛏️ {filteredRooms.length} Available {filteredRooms.length === 1 ? "Room" : "Rooms"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-6 w-full px-6 lg:px-8 py-6">
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <div className="sticky top-20 rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">🔍 Filter Rooms</h3>
              <button onClick={resetFilters} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">Reset</button>
            </div>

            <div className="mb-4">
              <label className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1">Search Room</label>
              <input type="text" placeholder="Room # or type..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="form-input w-full text-xs" />
            </div>

            <div className="mb-4">
              <label className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1">Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-select w-full text-xs">
                <option value="default">Default</option>
                <option value="priceLowHigh">Price: Low to High</option>
                <option value="priceHighLow">Price: High to Low</option>
                <option value="roomAsc">Room Number</option>
              </select>
            </div>

            <div className="mb-4">
              <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase mb-2">Bed Type</p>
              <div className="flex flex-col gap-2">
                {[
                  { name: "kingSizeBed", label: "🛏️ King Size" },
                  { name: "queenSizeBed", label: "🛏️ Queen Size" },
                  { name: "singleBed", label: "🛌 Single Bed" },
                  { name: "doubleBed", label: "🛏️ Double Bed" },
                ].map((f) => (
                  <label key={f.name} className={filterCheckboxClass}>
                    <input type="checkbox" name={f.name} checked={filters[f.name]} onChange={handleFilterChange} className="accent-blue-600" />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase mb-2">Amenities</p>
              <div className="flex flex-col gap-2">
                {[
                  { name: "ac", label: "❄️ AC" },
                  { name: "wifi", label: "📶 Free WiFi" },
                  { name: "tv", label: "📺 TV" },
                  { name: "geyser", label: "🚿 Geyser" },
                  { name: "miniFridge", label: "🧊 Mini Fridge" },
                  { name: "bathtub", label: "🛁 Bathtub" },
                  { name: "balcony", label: "🌅 Balcony" },
                  { name: "sofa", label: "🛋️ Sofa Set" },
                  { name: "locker", label: "🔐 Locker" },
                ].map((f) => (
                  <label key={f.name} className={filterCheckboxClass}>
                    <input type="checkbox" name={f.name} checked={filters[f.name]} onChange={handleFilterChange} className="accent-blue-600" />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase mb-2">Services</p>
              <div className="flex flex-col gap-2">
                {[
                  { name: "roomService", label: "🍽️ Room Service" },
                  { name: "laundryService", label: "🧺 Laundry" },
                  { name: "housekeeping", label: "🧹 Housekeeping" },
                ].map((f) => (
                  <label key={f.name} className={filterCheckboxClass}>
                    <input type="checkbox" name={f.name} checked={filters[f.name]} onChange={handleFilterChange} className="accent-blue-600" />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 w-full">
          {loading ? (
            <div className="text-center py-20 text-slate-400 dark:text-slate-500">Loading available rooms...</div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-5xl mb-4">🛏️</div>
              <p className="text-slate-500 dark:text-slate-400 mb-5">No active rooms match your selected filter criteria.</p>
              <button onClick={resetFilters} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all duration-200">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 w-full" id="rooms-grid">
              {filteredRooms.map((room) => (
                <div key={room._id} className="user-hotel-card w-full">
                  <div className="h-48 bg-slate-100 dark:bg-slate-700 overflow-hidden relative">
                    {room.images && room.images.length > 0 ? (
                      <img src={room.images[0]} alt="Room Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm">🛏️ Photo Unavailable</div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-slate-800 dark:text-white">Room #{room.roomNumber}</h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {room.roomType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">Floor {room.floor} · {room.capacity} Guest(s)</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Bed: {room.kingSizeBed ? "King Size" : room.queenSizeBed ? "Queen Size" : room.doubleBed ? "Double" : room.singleBed ? "Single" : "Standard"}
                    </p>

                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">₹{room.pricePerNight} <span className="text-xs font-normal text-slate-400">/ night</span></p>


                    <div className="flex flex-wrap gap-1 mt-1">
                      {room.ac && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400">❄️ AC</span>}
                      {room.wifi && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400">📶 WiFi</span>}
                      {room.tv && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400">📺 TV</span>}
                      {room.geyser && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400">🚿 Geyser</span>}
                      {room.balcony && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400">🌅 Balcony</span>}
                    </div>

                    <h3
                      onClick={() => handleViewDetails(room._id)}
                      className="text-l font-semibold text-blue-600 dark:text-blue-400 underline cursor-pointer hover:text-blue-500 dark:hover:text-blue-300 w-fit"
                    >
                      <strong> View Details</strong>
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      {isModalOpen && selectedRoom && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl font-bold" onClick={closeModal}>✕</button>

            {!bookingSuccess ? (
              <form onSubmit={handleConfirmBooking} className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Confirm Booking</h2>
                <p className="text-base font-semibold text-blue-600 dark:text-blue-400">
                  Room #{selectedRoom.roomNumber} · {selectedRoom.roomType}
                </p>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">Check In</label>
                  <input type="date" value={startDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setStartDate(e.target.value)} required className="form-input w-full" />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">Check Out</label>
                  <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} required className="form-input w-full" />
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-700/30 flex flex-col gap-2">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>Price / Night</span>
                    <span>₹{selectedRoom.pricePerNight}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>Total Nights</span>
                    <span>{totalNights}</span>
                  </div>
                  <hr className="border-slate-200 dark:border-slate-600" />
                  <div className="flex justify-between font-bold text-base text-slate-900 dark:text-white">
                    <span>Total Price</span>
                    <span>₹{totalPrice}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all duration-200 disabled:opacity-50"
                >
                  {submitting ? "Booking..." : `Confirm Booking ₹${totalPrice}`}
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center text-center gap-3">
                <div className="text-4xl mb-2">🎉</div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Booking Successful!</h2>
                <div className="w-full text-left flex flex-col gap-2 mt-2">
                  {[
                    ["Booking ID", createdBooking?._id],
                    ["Hotel", hotelData.hotelname],
                    ["Room", `#${selectedRoom.roomNumber}`],
                    ["Check In", startDate],
                    ["Check Out", endDate],
                    ["Total", `₹${totalPrice}`],
                    ["Status", createdBooking?.status],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-2 text-sm">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[80px]">{label}:</span>
                      <span className="text-slate-600 dark:text-slate-400">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 w-full mt-3">
                  <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all duration-200" onClick={() => navigate("/userbookings")}>
                    View My Bookings
                  </button>
                  <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-action-secondary" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {isViewModalOpen && (
        <div className="modal-overlay" onClick={closeViewModal}>
          <div
            className="modal-box max-h-[90vh] overflow-y-auto max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl font-bold"
              onClick={closeViewModal}
            >
              ✕
            </button>

            {viewLoading ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                Loading room details...
              </div>
            ) : !viewedRoom ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                No details found.
              </div>
            ) : (
              <div className="flex flex-col gap-5">

                {viewedRoom.images && viewedRoom.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {viewedRoom.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700"
                      >
                        <img
                          src={img}
                          alt={`Room ${viewedRoom.roomNumber} - ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-40 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 text-sm">
                    🛏️ Photo Unavailable
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Room #{viewedRoom.roomNumber}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {viewedRoom.hotelId?.hotelname}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {viewedRoom.roomType}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-700/30">
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">Floor</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{viewedRoom.floor}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">Capacity</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{viewedRoom.capacity} Guest(s)</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">Price / Night</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">₹{viewedRoom.pricePerNight}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">Available</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{viewedRoom.isAvailable ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">Status</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{viewedRoom.isActive ? "Active" : "Inactive"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase mb-2">Bed Type</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(bedLabels)
                      .filter(([key]) => viewedRoom[key])
                      .map(([key, label]) => (
                        <span
                          key={key}
                          className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                        >
                          🛏️ {label}
                        </span>
                      ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase mb-2">
                    Amenities & Services
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(amenityLabels)
                      .filter(([key]) => viewedRoom[key])
                      .map(([key, label]) => (
                        <span
                          key={key}
                          className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400"
                        >
                          {label}
                        </span>
                      ))}
                  </div>
                </div>

                {viewedRoom.hotelId && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-700/30">
                    <p className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2">
                      Hotel Contact
                    </p>
                    <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                      <span>🏨 {viewedRoom.hotelId.hotelname}</span>
                      <span>👤 {viewedRoom.hotelId.ownername}</span>
                      <span>📧 {viewedRoom.hotelId.hotelemail}</span>
                      <span>📞 {viewedRoom.hotelId.hotelphone}</span>
                    </div>
                  </div>
                )}

                {/* <button
                  onClick={closeViewModal}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold btn-action-secondary"
                >
                  Close
                </button> */}
                <button

                  onClick={() => {
                    closeViewModal();
                    handleBookRoom(viewedRoom)
                  }}
                  className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/20 transition-all duration-200"
                >
                  Book Now
                </button>
              </div>
            )}
          </div>
        </div>
      )
      }
    </div >
  );
}

export default HotelRoom;