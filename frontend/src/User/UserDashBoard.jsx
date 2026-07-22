import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";

function UserDashBoard() {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pageRef = useRef(null);
  const cardsRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("currentuser")) || null;

  useEffect(() => {
    async function loadHotels() {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:1100/hotel/allhotels");
        setHotels(res.data || []);
      } catch (error) {
        console.log("Error loading hotels:", error);
        setHotels([]);
      } finally {
        setLoading(false);
      }
    }

    loadHotels();
  }, []);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.from(".user-navbar, .user-hero", {
        autoAlpha: 0,
        duration: 0.7,
        y: -22,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, pageRef);

    return () => context.revert();
  }, []);

  useEffect(() => {
    if (loading || !cardsRef.current?.children.length) return;

    const context = gsap.context(() => {
      gsap.from(cardsRef.current.children, {
        autoAlpha: 0,
        duration: 0.65,
        y: 28,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
      });
    }, cardsRef);

    return () => context.revert();
  }, [loading, hotels.length, searchQuery]);
  const handleHotelClick = (hotel) => {
    if (!currentUser) {
      alert("Please login first to explore hotel details and book rooms!");
      navigate("/"); 
    } else {
      navigate("/hotelrooms", { state: { hotelData: hotel } });
    }
  };
  const filteredHotels = hotels.filter((hotel) => {
    const q = searchQuery.toLowerCase();
    const name = hotel.hotelname ? hotel.hotelname.toLowerCase() : "";
    const city = hotel.cityId?.cityName ? hotel.cityId.cityName.toLowerCase() : "";
    const address = hotel.hoteladdress ? hotel.hoteladdress.toLowerCase() : "";

    return name.includes(q) || city.includes(q) || address.includes(q);
  });

  return (
    <div className="user-dashboard" ref={pageRef}>

      <div className="user-navbar">
        <h2 className="user-brand">
          🏨 StayEasy Hotels
        </h2>

        <div>
          {currentUser ? (
            <div className="user-nav-actions">
              <span>Welcome, <strong>{currentUser.name || currentUser.username || "User"}</strong></span>
              <button
                onClick={() => {
                  localStorage.removeItem("currentuser");
                  navigate("/");
                }}
                className="user-btn user-btn-logout"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="user-nav-actions user-nav-login">
              <button
                onClick={() => navigate("/login")}
                className="user-btn user-btn-login"
              >
                Login
              </button>
              
            </div>
          )}
        </div>
      </div>

      <div className="user-hero">
        <h1 className="user-hero-title">Find Your Perfect Stay</h1>
        <p className="user-hero-description">
          Discover top-rated luxury hotels, suites, and comfortable rooms at unbeatable prices.
        </p>

        <input
          type="text"
          placeholder="Search by hotel name, city, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="user-search-input"
        />
      </div>

      <div className="user-hotels-section">
        <h2 className="user-section-title">Available Hotels</h2>

        {loading ? (
          <p className="user-loading-message">Loading luxury hotels...</p>
        ) : filteredHotels.length === 0 ? (
          <p className="user-empty-message">
            No hotels match your search criteria.
          </p>
        ) : (
          <div className="user-hotel-grid" ref={cardsRef}>
            {filteredHotels.map((hotel) => (
              <div
                key={hotel._id}
                onClick={() => handleHotelClick(hotel)}
                className="user-hotel-card"
              >
                {/* Hotel Image */}
                <div className="user-hotel-image">
                  {hotel.images && hotel.images.length > 0 ? (
                    <img
                      src={hotel.images[0]}
                      alt={hotel.hotelname}
                      className="user-card-image"
                    />
                  ) : (
                    <div className="user-image-placeholder">
                      🏨 Photo Unavailable
                    </div>
                  )}
                </div>

                <div className="user-hotel-card-body">
                  <h3 className="user-hotel-name">
                    {hotel.hotelname}
                  </h3>

                  <p className="user-hotel-detail">
                    📍 <strong>Location:</strong> {hotel.cityId?.cityName || "City"}, {hotel.stateId?.stateName || "State"}
                  </p>

                  <p className="user-hotel-detail">
                    🏠 <strong>Address:</strong> {hotel.hoteladdress}
                  </p>

                  <p className="user-hotel-detail">
                    🛏️ <strong>Total Rooms:</strong> {hotel.totalrooms || "N/A"}
                  </p>

                  <button
                    className="user-view-rooms-btn"
                  >
                    View Rooms & Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashBoard;
