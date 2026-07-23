import { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import { gsap } from "gsap";
import { useLocation, useNavigate } from "react-router-dom";
import "./modal.css";

function HotelRoom() {
  const location = useLocation();
  const navigate = useNavigate();

  const hotelData = location.state?.hotelData || null;

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const contentRef = useRef(null);
  const roomsRef = useRef(null);

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
    kingSizeBed: false,
    queenSizeBed: false,
    singleBed: false,
    doubleBed: false,
    ac: false,
    wifi: false,
    tv: false,
    geyser: false,
    miniFridge: false,
    bathtub: false,
    balcony: false,
    sofa: false,
    locker: false,
    roomService: false,
    laundryService: false,
    housekeeping: false,
  });

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: checked }));
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSortBy("default");
    setFilters({
      kingSizeBed: false,
      queenSizeBed: false,
      singleBed: false,
      doubleBed: false,
      ac: false,
      wifi: false,
      tv: false,
      geyser: false,
      miniFridge: false,
      bathtub: false,
      balcony: false,
      sofa: false,
      locker: false,
      roomService: false,
      laundryService: false,
      housekeeping: false,
    });
  };

  useEffect(() => {
    if (!hotelData?._id) return;

    async function loadHotelRooms() {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:1100/room/getallrooms");
        const activeHotelRooms = (res.data || []).filter(
          (room) =>
            room.isActive === true &&
            (room.hotelId === hotelData._id || room.hotelId?._id === hotelData._id)
        );
        setRooms(activeHotelRooms);
      } catch (error) {
        console.log("Error loading rooms:", error);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    }

    loadHotelRooms();
  }, [hotelData]);

  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => {
        // Search bar (Room Number or Type)
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          room.roomNumber?.toString().includes(query) ||
          room.roomType?.toLowerCase().includes(query);

        if (!matchesQuery) return false;

        for (const [key, value] of Object.entries(filters)) {
          if (value && !room[key]) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "priceLowHigh") return a.pricePerNight - b.pricePerNight;
        if (sortBy === "priceHighLow") return b.pricePerNight - a.pricePerNight;
        if (sortBy === "roomAsc") return a.roomNumber - b.roomNumber;
        return 0;
      });
  }, [rooms, searchQuery, filters, sortBy]);

  useEffect(() => {
    if (!hotelData) return undefined;

    const context = gsap.context(() => {
      gsap.from(".user-back-button, .user-selected-hotel, .user-section-title", {
        autoAlpha: 0,
        duration: 0.75,
        y: 24,
        stagger: 0.1,
        ease: "back.out(1.7)",
      });
    }, contentRef);

    return () => context.revert();
  }, [hotelData]);

  useEffect(() => {
    if (loading || !roomsRef.current?.children.length) return;

    const context = gsap.context(() => {
      gsap.from(roomsRef.current.children, {
        autoAlpha: 0,
        duration: 0.5,
        y: 20,
        stagger: 0.05,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
      });
    }, roomsRef);

    return () => context.revert();
  }, [loading, filteredRooms.length]);

  useEffect(() => {
    if (!selectedRoom || !startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const difference =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    if (difference <= 0) {
      setTotalNights(1);
      setTotalPrice(selectedRoom.pricePerNight);
    } else {
      setTotalNights(difference);
      setTotalPrice(difference * selectedRoom.pricePerNight);
    }
  }, [startDate, endDate, selectedRoom]);

  const handleBookRoom = (room) => {
    setSelectedRoom(room);

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const checkIn = today.toISOString().split("T")[0];
    const checkOut = tomorrow.toISOString().split("T")[0];

    setStartDate(checkIn);
    setEndDate(checkOut);

    setTotalNights(1);
    setTotalPrice(room.pricePerNight);

    setBookingSuccess(false);
    setCreatedBooking(null);

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
    setStartDate("");
    setEndDate("");
    setBookingSuccess(false);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    const currentUser = JSON.parse(
      localStorage.getItem("currentuser")
    );

    if (!currentUser) {
      alert("Please login first.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        "http://localhost:1100/booking/create",
        {
          userId: currentUser._id,
          hotelId: hotelData._id,
          roomId: selectedRoom._id,
          price: totalPrice,
          startDate,
          endDate,
        }
      );

      if (response.data.success) {
        setCreatedBooking(response.data.booking);
        setBookingSuccess(true);

        setRooms((prevRooms) =>
          prevRooms.filter((room) => room._id !== selectedRoom._id)
        );
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Booking Failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!hotelData) {
    return (
      <div className="user-no-hotel">
        <h2>No Hotel Selected</h2>
        <button
          onClick={() => navigate("/userdashboard")}
          className="user-back-hotels-btn"
        >
          Back to Hotels
        </button>
      </div>
    );
  }

  return (
    <div className="user-hotel-room-page">
      <div className="user-room-content" ref={contentRef}>
        <button
          onClick={() => navigate(-1)}
          className="user-back-hotels-btn user-back-button"
        >
          ← Back to Hotels
        </button>

        <div className="user-selected-hotel">
          <h1 className="user-selected-hotel-name">{hotelData.hotelname}</h1>
          <p className="user-selected-hotel-detail">
            📍 <strong>Location:</strong> {hotelData.cityId?.cityName || "City"},{" "}
            {hotelData.stateId?.stateName || "State"}
          </p>
          <p className="user-selected-hotel-detail">
            🏠 <strong>Address:</strong> {hotelData.hoteladdress}
          </p>
        </div>

        <h2 className="user-section-title">Available Rooms</h2>

        <div className="room-layout-container">
          <aside className="room-sidebar-filter">
            <div className="sidebar-header">
              <h3>🔍 Filter Rooms</h3>
              <button onClick={resetFilters} className="reset-filter-btn">
                Reset
              </button>
            </div>

            <div className="sidebar-group">
              <label>Search Room</label>
              <input
                type="text"
                placeholder="Room # or type (e.g. Deluxe)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sidebar-input"
              />
            </div>

            <div className="sidebar-group">
              <label>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sidebar-input"
              >
                <option value="default">Default</option>
                <option value="priceLowHigh">Price: Low to High</option>
                <option value="priceHighLow">Price: High to Low</option>
                <option value="roomAsc">Room Number</option>
              </select>
            </div>

            <div className="sidebar-group">
              <label className="sidebar-subheading">Bed Type</label>
              <div className="checkbox-list">
                <label className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    name="kingSizeBed"
                    checked={filters.kingSizeBed}
                    onChange={handleFilterChange}
                  />
                  🛏️ King Size Bed
                </label>
                <label className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    name="queenSizeBed"
                    checked={filters.queenSizeBed}
                    onChange={handleFilterChange}
                  />
                  🛏️ Queen Size Bed
                </label>
                <label className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    name="singleBed"
                    checked={filters.singleBed}
                    onChange={handleFilterChange}
                  />
                  🛌 Single Bed
                </label>
                <label className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    name="doubleBed"
                    checked={filters.doubleBed}
                    onChange={handleFilterChange}
                  />
                  🛏️ Double Bed
                </label>
              </div>
            </div>

            <div className="sidebar-group">
              <label className="sidebar-subheading">Amenities</label>
              <div className="checkbox-list">
                <label className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    name="ac"
                    checked={filters.ac}
                    onChange={handleFilterChange}
                  />
                  ❄️ AC
                </label>
                <label className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    name="wifi"
                    checked={filters.wifi}
                    onChange={handleFilterChange}
                  />
                  📶 Free WiFi
                </label>
                <label className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    name="tv"
                    checked={filters.tv}
                    onChange={handleFilterChange}
                  />
                  📺 TV
                </label>
                <label className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    name="geyser"
                    checked={filters.geyser}
                    onChange={handleFilterChange}
                  />
                  🚿 Geyser
                </label>
                <label className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    name="miniFridge"
                    checked={filters.miniFridge}
                    onChange={handleFilterChange}
                  />
                  🧊 Mini Fridge
                </label>
                <label className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    name="bathtub"
                    checked={filters.bathtub}
                    onChange={handleFilterChange}
                  />
                  🛁 Bathtub
                </label>
                <label className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    name="balcony"
                    checked={filters.balcony}
                    onChange={handleFilterChange}
                  />
                  🌅 Balcony
                </label>
                <label className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    name="sofa"
                    checked={filters.sofa}
                    onChange={handleFilterChange}
                  />
                  🛋️ Sofa Set
                </label>
                <label className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    name="locker"
                    checked={filters.locker}
                    onChange={handleFilterChange}
                  />
                  🔐 Locker
                </label>
              </div>
            </div>

            <div className="sidebar-group">
              <label className="sidebar-subheading">Services Offered</label>
              <div className="checkbox-list">
                <label className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    name="roomService"
                    checked={filters.roomService}
                    onChange={handleFilterChange}
                  />
                  🍽️ 24/7 Room Service
                </label>
                <label className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    name="laundryService"
                    checked={filters.laundryService}
                    onChange={handleFilterChange}
                  />
                  🧺 Laundry Service
                </label>
                <label className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    name="housekeeping"
                    checked={filters.housekeeping}
                    onChange={handleFilterChange}
                  />
                  🧹 Housekeeping
                </label>
              </div>
            </div>
          </aside>

          <main className="room-main-area">
            {loading ? (
              <p className="loading-text">Loading available rooms...</p>
            ) : filteredRooms.length === 0 ? (
              <div className="user-empty-message">
                <p className="user-empty-room-text">
                  No active rooms match your selected filter criteria.
                </p>
                <button onClick={resetFilters} className="user-back-hotels-btn">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="user-room-grid" ref={roomsRef}>
                {filteredRooms.map((room) => (
                  <div key={room._id} className="user-room-card">
                    <div className="user-room-image">
                      {room.images && room.images.length > 0 ? (
                        <img
                          src={room.images[0]}
                          alt="Room Preview"
                          className="user-card-image"
                        />
                      ) : (
                        <div className="user-image-placeholder">
                          🛏️ Photo Unavailable
                        </div>
                      )}
                    </div>

                    <div className="user-room-card-body">
                      <div className="user-room-card-heading">
                        <h3 className="user-room-name">Room #{room.roomNumber}</h3>
                        <span className="user-room-type">{room.roomType}</span>
                      </div>

                      <p className="user-room-detail">
                        <strong>Floor:</strong> {room.floor}
                      </p>
                      <p className="user-room-detail">
                        <strong>Capacity:</strong> {room.capacity} Guest(s)
                      </p>

                      <p className="user-room-detail">
                        <strong>Bed:</strong>{" "}
                        {room.kingSizeBed
                          ? "King Size"
                          : room.queenSizeBed
                            ? "Queen Size"
                            : room.doubleBed
                              ? "Double Bed"
                              : room.singleBed
                                ? "Single Bed"
                                : "Standard"}
                      </p>

                      <p className="user-room-price">
                        ₹{room.pricePerNight} / night
                      </p>

                      <div className="user-room-facilities">
                        {room.ac && <span className="user-facility-badge">❄️ AC</span>}
                        {room.wifi && <span className="user-facility-badge">📶 WiFi</span>}
                        {room.tv && <span className="user-facility-badge">📺 TV</span>}
                        {room.geyser && <span className="user-facility-badge">🚿 Geyser</span>}
                        {room.miniFridge && <span className="user-facility-badge">🧊 Fridge</span>}
                        {room.bathtub && <span className="user-facility-badge">🛁 Bathtub</span>}
                        {room.balcony && <span className="user-facility-badge">🌅 Balcony</span>}
                      </div>

                      <button
                        onClick={() => handleBookRoom(room)}
                        className="user-book-room-btn"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

\      {isModalOpen && selectedRoom && (
        <div className="modal-overlay">
          <div className="booking-modal">
            <button className="modal-close-btn" onClick={closeModal}>
              ✕
            </button>

            {!bookingSuccess ? (
              <form onSubmit={handleConfirmBooking} className="modal-form">
                <h2>Confirm Booking</h2>

                <h3>Room #{selectedRoom.roomNumber}</h3>
                <p>{selectedRoom.roomType}</p>

                <div className="modal-form-group">
                  <label>Check In</label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-form-group">
                  <label>Check Out</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>

                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Price / Night</span>
                    <span>₹{selectedRoom.pricePerNight}</span>
                  </div>

                  <div className="price-row">
                    <span>Total Nights</span>
                    <span>{totalNights}</span>
                  </div>

                  <hr />

                  <div className="price-row total">
                    <strong>Total Price</strong>
                    <strong>₹{totalPrice}</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="user-book-room-btn"
                >
                  {submitting ? "Booking..." : `Confirm Booking ₹${totalPrice}`}
                </button>
              </form>
            ) : (
              <div className="booking-success">
                <h2>🎉 Booking Successful</h2>

                <p>
                  Booking ID : <strong>{createdBooking?._id}</strong>
                </p>
                <p>
                  Hotel : <strong>{hotelData.hotelname}</strong>
                </p>
                <p>
                  Room : <strong>#{selectedRoom.roomNumber}</strong>
                </p>
                <p>
                  Check In : <strong>{startDate}</strong>
                </p>
                <p>
                  Check Out : <strong>{endDate}</strong>
                </p>
                <p>
                  Total : <strong>₹{totalPrice}</strong>
                </p>
                <p>
                  Status : <strong>{createdBooking?.status}</strong>
                </p>

                <div className="modal-actions">
                  <button
                    className="user-book-room-btn"
                    onClick={() => navigate("/userbookings")}
                  >
                    View My Bookings
                  </button>
                  <button className="user-back-hotels-btn" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HotelRoom;