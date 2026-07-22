import { useEffect, useRef, useState } from "react";
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
        duration: 0.65,
        y: 28,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
      });
    }, roomsRef);

    return () => context.revert();
  }, [loading, rooms.length]);

  useEffect(() => {
    if (!selectedRoom) return;
    if (!startDate || !endDate) return;

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
            📍 <strong>Location:</strong> {hotelData.cityId?.cityName || "City"}, {hotelData.stateId?.stateName || "State"}
          </p>
          <p className="user-selected-hotel-detail">
            🏠 <strong>Address:</strong> {hotelData.hoteladdress}
          </p>
        </div>

        <h2 className="user-section-title">Available Rooms</h2>

        {loading ? (
          <p>Loading available rooms...</p>
        ) : rooms.length === 0 ? (
          <div className="user-empty-message">
            <p className="user-empty-room-text">No active rooms available for this hotel right now.</p>
          </div>
        ) : (
          <div className="user-room-grid" ref={roomsRef}>
            {rooms.map((room) => (
              <div
                key={room._id}
                className="user-room-card"
              >
                <div className="user-room-image">
                  {room.images && room.images.length > 0 ? (
                    <img src={room.images[0]} alt="Room Preview" className="user-card-image" />
                  ) : (
                    <div className="user-image-placeholder">
                      🛏️ Photo Unavailable
                    </div>
                  )}
                </div>

                <div className="user-room-card-body">
                  <div className="user-room-card-heading">
                    <h3 className="user-room-name">Room #{room.roomNumber}</h3>
                    <span className="user-room-type">
                      {room.roomType}
                    </span>
                  </div>

                  <p className="user-room-detail">
                    <strong>Floor:</strong> {room.floor}
                  </p>
                  <p className="user-room-detail">
                    <strong>Capacity:</strong> {room.capacity} Guest(s)
                  </p>
                  <p className="user-room-price">
                    ₹{room.pricePerNight} / night
                  </p>

                  <div className="user-room-facilities">
                    {room.ac && <span className="user-facility-badge">❄️ AC</span>}
                    {room.wifi && <span className="user-facility-badge">📶 WiFi</span>}
                    {room.tv && <span className="user-facility-badge">📺 TV</span>}
                    {room.geyser && <span className="user-facility-badge">🚿 Geyser</span>}
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
      </div>

      {isModalOpen && selectedRoom && (
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

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "20px",
                    justifyContent: "center",
                  }}
                >
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