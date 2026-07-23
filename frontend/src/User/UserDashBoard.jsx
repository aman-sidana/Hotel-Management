import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import UseTheme from "../custom hooks/Usetheme";

import Navbar from "../genericComponents/Navbar";

function UserDashBoard() {
  const navigate = useNavigate();
  const { theme, changeTheme } = UseTheme();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
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
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
      });
    }, cardsRef);

    return () => context.revert();
  }, [loading, hotels.length, searchQuery, sortBy]);

  const handleHotelClick = (hotel) => {
    if (!currentUser) {
      alert("Please login first to explore hotel details and book rooms!");
      navigate("/");
    } else {
      navigate("/hotelrooms", { state: { hotelData: hotel } });
    }
  };

  const filteredAndSortedHotels = hotels
    .filter((hotel) => {
      const q = searchQuery.toLowerCase();
      const name = hotel.hotelname ? hotel.hotelname.toLowerCase() : "";
      const city = hotel.cityId?.cityName ? hotel.cityId.cityName.toLowerCase() : "";
      const address = hotel.hoteladdress ? hotel.hoteladdress.toLowerCase() : "";
      return name.includes(q) || city.includes(q) || address.includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "nameAsc") {
        return (a.hotelname || "").localeCompare(b.hotelname || "");
      } else if (sortBy === "nameDesc") {
        return (b.hotelname || "").localeCompare(a.hotelname || "");
      } else if (sortBy === "roomsHigh") {
        return Number(b.totalrooms || 0) - Number(a.totalrooms || 0);
      } else if (sortBy === "roomsLow") {
        return Number(a.totalrooms || 0) - Number(b.totalrooms || 0);
      } else if (sortBy === "cityAsc") {
        const cityA = a.cityId?.cityName || "";
        const cityB = b.cityId?.cityName || "";
        return cityA.localeCompare(cityB);
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16" ref={pageRef}>
      {/* Industry Standard Navbar */}
      <Navbar />

      {/* Hero */}
      <div className="user-hero text-center py-16 px-5 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4
          bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
          🌟 Premium Hotel Stays
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-br from-slate-900 via-blue-700 to-sky-400 dark:from-white dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent">
          Find Your Perfect Stay
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg mb-8">
          Discover top-rated luxury hotels, suites, and comfortable rooms at unbeatable prices.
        </p>

        {/* Search & Sort Container */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-2xl mx-auto">
          <div className="relative w-full flex-1">
            <input
              type="text"
              placeholder="Search by hotel name, city, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl text-sm
                bg-white dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                text-slate-800 dark:text-slate-100
                placeholder-slate-400 dark:placeholder-slate-500
                focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20
                shadow-sm transition-all duration-200"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-4 py-3.5 rounded-2xl text-sm font-semibold
              bg-white dark:bg-slate-800
              border border-slate-200 dark:border-slate-700
              text-slate-700 dark:text-slate-200
              focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20
              shadow-sm cursor-pointer transition-all duration-200"
          >
            <option value="default">Sort By: Default</option>
            <option value="nameAsc">Name (A to Z)</option>
            <option value="nameDesc">Name (Z to A)</option>
            <option value="roomsHigh">Rooms (High to Low)</option>
            <option value="roomsLow">Rooms (Low to High)</option>
            <option value="cityAsc">City (A to Z)</option>
          </select>
        </div>
      </div>

      {/* Hotels Grid - Full Screen Layout */}
      <div className="w-full px-6 lg:px-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Available Hotels
            {filteredAndSortedHotels.length > 0 && (
              <span className="ml-2.5 text-sm font-normal text-slate-400 dark:text-slate-500">
                ({filteredAndSortedHotels.length} {filteredAndSortedHotels.length === 1 ? "hotel" : "hotels"} found)
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 dark:text-slate-500">Loading luxury hotels...</p>
          </div>
        ) : filteredAndSortedHotels.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-md mx-auto">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No Hotels Found</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm px-6 mb-4">
              We couldn't find any hotels matching "{searchQuery}".
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSortBy("default"); }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
            >
              Clear Search & Filters
            </button>
          </div>
        ) : (
          /* 4 Hotels per row grid on lg & xl screen sizes */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6" ref={cardsRef}>
            {filteredAndSortedHotels.map((hotel) => (
              <div
                key={hotel._id}
                onClick={() => handleHotelClick(hotel)}
                className="user-hotel-card group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Increased Hotel Card Image Height */}
                <div className="h-56 bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                  {hotel.images && hotel.images.length > 0 ? (
                    <img
                      src={hotel.images[0]}
                      alt={hotel.hotelname}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm gap-2">
                      <span className="text-3xl">🏨</span>
                      <span>Photo Unavailable</span>
                    </div>
                  )}

                  {hotel.cityId?.cityName && (
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-slate-900/70 text-white backdrop-blur-md">
                      📍 {hotel.cityId.cityName}
                    </span>
                  )}
                </div>

                {/* Hotel Card Info with increased padding and text size */}
                <div className="p-5 flex flex-col gap-2.5 flex-1">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                    {hotel.hotelname}
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span>📍</span>
                    <span className="truncate">{hotel.cityId?.cityName || "City"}, {hotel.stateId?.stateName || "State"}</span>
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px]">
                    🏠 {hotel.hoteladdress}
                  </p>

                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-700/60 mt-auto">
                    <span>🛏️ {hotel.totalrooms || "N/A"} Total Rooms</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Verified</span>
                  </div>

                  <button
                    className="mt-2 w-full py-3 rounded-xl text-sm font-bold text-white
                      bg-blue-600 group-hover:bg-blue-500 shadow-md shadow-blue-600/20
                      transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>View Rooms & Book</span>
                    <span>→</span>
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
