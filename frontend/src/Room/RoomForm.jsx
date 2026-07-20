import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function RoomForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const existingRoom = location.state?.roomData || null;
  const isEditMode = !!existingRoom;

  const currentUser = JSON.parse(localStorage.getItem("currentuser")) || {};
  const isAdmin = currentUser?.role?.toLowerCase() === "admin" || currentUser?.role?.toLowerCase() === "superadmin";

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [form, setForm] = useState({
    hotelId: existingRoom?.hotelId?._id || existingRoom?.hotelId || "",
    roomNumber: existingRoom?.roomNumber || "",
    floor: existingRoom?.floor || 1,
    roomType: existingRoom?.roomType || "Single",
    pricePerNight: existingRoom?.pricePerNight || "",
    capacity: existingRoom?.capacity || 2,

    kingSizeBed: existingRoom?.kingSizeBed || false,
    queenSizeBed: existingRoom?.queenSizeBed || false,
    singleBed: existingRoom?.singleBed || false,
    doubleBed: existingRoom?.doubleBed || false,

    ac: existingRoom?.ac || false,
    cooler: existingRoom?.cooler || false,
    attachedBathroom: existingRoom?.attachedBathroom || false,
    bathtub: existingRoom?.bathtub || false,
    geyser: existingRoom?.geyser || false,
    tv: existingRoom?.tv || false,
    wifi: existingRoom?.wifi || false,
    telephone: existingRoom?.telephone || false,
    miniFridge: existingRoom?.miniFridge || false,
    microwave: existingRoom?.microwave || false,
    electricKettle: existingRoom?.electricKettle || false,
    sofa: existingRoom?.sofa || false,
    diningTable: existingRoom?.diningTable || false,
    wardrobe: existingRoom?.wardrobe || false,
    balcony: existingRoom?.balcony || false,
    locker: existingRoom?.locker || false,
    smokeDetector: existingRoom?.smokeDetector || false,
    fireExtinguisher: existingRoom?.fireExtinguisher || false,

    roomService: existingRoom?.roomService || false,
    laundryService: existingRoom?.laundryService || false,
    housekeeping: existingRoom?.housekeeping || false,
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const res = await axios.get("http://localhost:1100/hotel/allhotels");
      setHotels(Array.isArray(res.data) ? res.data : res.data.result || []);
    } catch (error) {
      console.log("Error fetching hotels:", error);
    }
  };

  // Handles text and select input changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Handles boolean checkbox toggles
  const handleCheckboxChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.checked,
    });
  };

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.hotelId || !form.roomNumber || !form.pricePerNight) {
      return alert("Please fill in all mandatory fields (*)");
    }

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      setLoading(true);

      if (isEditMode) {
        await axios.patch(
          `http://localhost:1100/room/updateroom?id=${existingRoom._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        alert("Room Details Updated Successfully!");
      } else {
        // Direct admin route or standard creation
        const endpoint = isAdmin
          ? "http://localhost:1100/room/admin-add-room"
          : "http://localhost:1100/room/addroom";

        await axios.post(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Room Entry Created Successfully!");
      }

      navigate(-1);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to process room details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "30px auto",
        padding: "25px",
        background: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, color: "#1e293b" }}>
          {isEditMode ? "Edit Room Details" : "Add New Room Configuration"}
        </h2>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{ padding: "8px 14px", background: "#64748b", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Hotel Dropdown */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#334155" }}>
            Select Hotel *
          </label>
          <select
            name="hotelId"
            required
            value={form.hotelId}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
          >
            <option value="">-- Choose Hotel --</option>
            {hotels.map((hotel) => (
              <option key={hotel._id} value={hotel._id}>
                {hotel.hotelname} ({hotel.hotelemail || hotel.hotelphone})
              </option>
            ))}
          </select>
        </div>

        {/* Basic Room Config */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#334155" }}>
              Room Number *
            </label>
            <input
              type="number"
              name="roomNumber"
              required
              placeholder="e.g. 101"
              value={form.roomNumber}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#334155" }}>
              Floor Number
            </label>
            <input
              type="number"
              name="floor"
              placeholder="e.g. 1"
              value={form.floor}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#334155" }}>
              Room Type
            </label>
            <select
              name="roomType"
              value={form.roomType}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
            >
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Twin">Twin</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
              <option value="Family">Family</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#334155" }}>
              Price Per Night (₹) *
            </label>
            <input
              type="number"
              name="pricePerNight"
              required
              placeholder="e.g. 2500"
              value={form.pricePerNight}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#334155" }}>
              Guest Capacity
            </label>
            <input
              type="number"
              name="capacity"
              placeholder="e.g. 2"
              value={form.capacity}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
            />
          </div>
        </div>

        {/* Bed Types */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#0d6efd" }}>
            Bed Configuration:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", background: "#f8fafc", padding: "12px", borderRadius: "6px" }}>
            {[
              { name: "kingSizeBed", label: "King Size Bed" },
              { name: "queenSizeBed", label: "Queen Size Bed" },
              { name: "singleBed", label: "Single Bed" },
              { name: "doubleBed", label: "Double Bed" },
            ].map((bed) => (
              <label key={bed.name} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name={bed.name}
                  checked={form[bed.name]}
                  onChange={handleCheckboxChange}
                  style={{ width: "16px", height: "16px" }}
                />
                {bed.label}
              </label>
            ))}
          </div>
        </div>

        {/* Room Facilities Checkboxes */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#0d6efd" }}>
            Facilities & Amenities:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px", background: "#f8fafc", padding: "12px", borderRadius: "6px" }}>
            {[
              { name: "ac", label: "Air Conditioner (AC)" },
              { name: "cooler", label: "Cooler" },
              { name: "attachedBathroom", label: "Attached Bathroom" },
              { name: "bathtub", label: "Bathtub" },
              { name: "geyser", label: "Geyser / Water Heater" },
              { name: "tv", label: "Television (TV)" },
              { name: "wifi", label: "Free WiFi" },
              { name: "telephone", label: "Telephone" },
              { name: "miniFridge", label: "Mini Fridge" },
              { name: "microwave", label: "Microwave" },
              { name: "electricKettle", label: "Electric Kettle" },
              { name: "sofa", label: "Sofa Set" },
              { name: "diningTable", label: "Dining Table" },
              { name: "wardrobe", label: "Wardrobe / Closet" },
              { name: "balcony", label: "Balcony / Terrace" },
              { name: "locker", label: "Locker / Safety Box" },
              { name: "smokeDetector", label: "Smoke Detector" },
              { name: "fireExtinguisher", label: "Fire Extinguisher" },
            ].map((item) => (
              <label key={item.name} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name={item.name}
                  checked={form[item.name]}
                  onChange={handleCheckboxChange}
                  style={{ width: "16px", height: "16px" }}
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        {/* Services Checkboxes */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#0d6efd" }}>
            Services Offered:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", background: "#f8fafc", padding: "12px", borderRadius: "6px" }}>
            {[
              { name: "roomService", label: "24/7 Room Service" },
              { name: "laundryService", label: "Laundry Service" },
              { name: "housekeeping", label: "Daily Housekeeping" },
            ].map((srv) => (
              <label key={srv.name} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name={srv.name}
                  checked={form[srv.name]}
                  onChange={handleCheckboxChange}
                  style={{ width: "16px", height: "16px" }}
                />
                {srv.label}
              </label>
            ))}
          </div>
        </div>

        {/* File Upload Section */}
        <div style={{ marginBottom: "25px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#334155" }}>
            Upload Room Photos
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            style={{ width: "100%", padding: "8px", border: "1px dashed #cbd5e1", borderRadius: "4px" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: loading ? "#94a3b8" : "#10b981",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Processing..." : isEditMode ? "Update Room Profile" : "Register Room"}
        </button>
      </form>
    </div>
  );
}

export default RoomForm;