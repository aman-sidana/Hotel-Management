import React, { useEffect, useState } from "react";
import axios from "axios";

function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [hotel, setHotel] = useState([]);

  // Active Tab State (active / inactive)
  const [activeTab, setActiveTab] = useState("active");

  // Search & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("codeAsc"); // codeAsc, codeDesc, discountAsc, discountDesc

  const [selectedFile, setSelectedFile] = useState(null);
  const [form, setForm] = useState({
    hotelId: "",
    couponCode: "",
    couponType: "flat",
    discount: "",
    minPriceAvail: "",
    startingDate: "",
    dateUpTo: "",
  });

  useEffect(() => {
    fetchCoupons();
    allhotel();
  }, []);

  const allhotel = async () => {
    try {
      const result = await axios.get("http://localhost:1100/hotel/allhotels");
      setHotel(Array.isArray(result.data) ? result.data : result.data.result || []);
    } catch (error) {
      console.log(error.response || error);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:1100/coupon/getallcoupon");
      setCoupons(res.data.result || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const openEditMode = (coupon) => {
    setIsEditMode(true);
    setEditingId(coupon._id);
    setForm({
      hotelId: coupon.hotelId?._id || coupon.hotelId || "",
      couponCode: coupon.couponCode || "",
      couponType: coupon.couponType || "flat",
      discount: coupon.discount || "",
      minPriceAvail: coupon.minPriceAvail || "",
      startingDate: coupon.startingDate ? coupon.startingDate.split("T")[0] : "",
      dateUpTo: coupon.dateUpTo ? coupon.dateUpTo.split("T")[0] : "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setIsEditMode(false);
    setEditingId(null);
    setSelectedFile(null);
    setForm({
      hotelId: "",
      couponCode: "",
      couponType: "flat",
      discount: "",
      minPriceAvail: "",
      startingDate: "",
      dateUpTo: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    if (selectedFile) {
      formData.append("images", selectedFile);
    }

    try {
      if (isEditMode) {
        await axios.put(`http://localhost:1100/coupon/updatecoupon?id=${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Coupon Updated Successfully");
      } else {
        await axios.post("http://localhost:1100/coupon/addcoupon", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Coupon Added Successfully");
      }
      closeForm();
      fetchCoupons();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Something went wrong saving the coupon.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:1100/coupon/deletecoupon?id=${id}`);
      alert("Coupon deleted successfully");
      fetchCoupons();
    } catch (error) {
      console.error(error);
      alert("Failed to delete coupon");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        await axios.patch(`http://localhost:1100/coupon/soft-delete?id=${id}`);
        alert("Coupon deactivated successfully");
      } else {
        await axios.patch(`http://localhost:1100/coupon/restore?id=${id}`);
        alert("Coupon restored successfully");
      }
      fetchCoupons();
    } catch (error) {
      console.error(error);
      alert("Failed to alter coupon operational status");
    }
  };

  // 1. Filter by Active / Inactive Tab
  const tabFilteredCoupons = coupons.filter((coupon) => {
    if (activeTab === "active") return coupon.isActive === true;
    if (activeTab === "inactive") return coupon.isActive === false;
    return true;
  });

  // 2. Search Filter (Coupon Code or Hotel Name)
  const searchedCoupons = tabFilteredCoupons.filter((coupon) => {
    const q = searchQuery.toLowerCase();
    const codeMatch = coupon.couponCode ? coupon.couponCode.toLowerCase().includes(q) : false;
    const hotelMatch = coupon.hotelId?.hotelname ? coupon.hotelId.hotelname.toLowerCase().includes(q) : false;
    return codeMatch || hotelMatch;
  });

  // 3. Sorting
  const displayedCoupons = [...searchedCoupons].sort((a, b) => {
    if (sortBy === "codeAsc") {
      return (a.couponCode || "").localeCompare(b.couponCode || "");
    } else if (sortBy === "codeDesc") {
      return (b.couponCode || "").localeCompare(a.couponCode || "");
    } else if (sortBy === "discountAsc") {
      return Number(a.discount || 0) - Number(b.discount || 0);
    } else if (sortBy === "discountDesc") {
      return Number(b.discount || 0) - Number(a.discount || 0);
    }
    return 0;
  });

  return (
    <div className="app-page app-page--management" style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Coupon Configuration Management</h2>
        <button
          onClick={showForm ? closeForm : () => setShowForm(true)}
          style={{ padding: "10px 15px", background: showForm ? "#6c757d" : "#0d6efd", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {showForm ? "Close Form" : "Add New Coupon"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "#f8f9fa", padding: "20px", borderRadius: "6px", marginBottom: "35px", border: "1px solid #e2e8f0" }}>
          <h3>{isEditMode ? "Edit Coupon Details" : "Create Promotional Coupon Entry"}</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Select Hotel</label>
              <select
                name="hotelId"
                required
                value={form.hotelId}
                onChange={handleChange}
                style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
              >
                <option value="">-- Select a Hotel --</option>
                {hotel.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.hotelname} ({h.hotelemail || h.hotelphone})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Coupon Code</label>
              <input type="text" name="couponCode" required value={form.couponCode} onChange={handleChange} style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Coupon Type</label>
              <select name="couponType" value={form.couponType} onChange={handleChange} style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}>
                <option value="flat">Flat Discount</option>
                <option value="percentage">Percentage Discount</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Discount Value</label>
              <input type="number" name="discount" required value={form.discount} onChange={handleChange} style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Min Price Available Threshold</label>
              <input type="number" name="minPriceAvail" value={form.minPriceAvail} onChange={handleChange} style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Display Advertisement Image</label>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ width: "100%", marginTop: "5px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Validity Starting Date</label>
              <input type="date" name="startingDate" required value={form.startingDate} onChange={handleChange} style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Expiration Threshold Date (Up To)</label>
              <input type="date" name="dateUpTo" required value={form.dateUpTo} onChange={handleChange} style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" style={{ padding: "10px 20px", background: "#198754", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
              {isEditMode ? "Save Parameter Changes" : "Deploy Coupon Registry"}
            </button>
            <button type="button" onClick={closeForm} style={{ padding: "10px 20px", background: "#e2e8f0", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tabs, Sort Dropdown & Search Controls */}
      <div style={{ margin: "20px 0", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("active")}
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            background: activeTab === "active" ? "#0d6efd" : "#e2e8f0",
            color: activeTab === "active" ? "#fff" : "#000",
          }}
        >
          Active Coupons
        </button>
        <button
          onClick={() => setActiveTab("inactive")}
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            background: activeTab === "inactive" ? "#0d6efd" : "#e2e8f0",
            color: activeTab === "inactive" ? "#fff" : "#000",
          }}
        >
          Inactive Coupons
        </button>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ marginLeft: "auto", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", cursor: "pointer" }}
        >
          <option value="codeAsc">Code (A - Z)</option>
          <option value="codeDesc">Code (Z - A)</option>
          <option value="discountAsc">Discount (Low to High)</option>
          <option value="discountDesc">Discount (High to Low)</option>
        </select>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search Code or Hotel..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "8px", width: "200px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>

      {loading ? (
        <p>Loading active promotional indexes...</p>
      ) : displayedCoupons.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666", padding: "30px" }}>
          No {activeTab === "active" ? "Active" : "Inactive"} coupons found.
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {displayedCoupons.map((coupon) => (
            <div key={coupon._id} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", background: coupon.isActive ? "#fff" : "#f1f5f9" }}>
              <div style={{ height: "140px", background: "#cbd5e1", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                {coupon.couponImages ? (
                  <img src={coupon.couponImages} alt="Promo Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ color: "#64748b", fontSize: "14px" }}>No Advert Image Uploaded</span>
                )}
              </div>

              <div style={{ padding: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ background: "#22c55e", color: "#fff", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "14px" }}>
                    {coupon.couponCode}
                  </span>
                  <span style={{ fontSize: "12px", padding: "3px 6px", borderRadius: "12px", fontWeight: "bold", background: coupon.isActive ? "#dcfce7" : "#fee2e2", color: coupon.isActive ? "#15803d" : "#b91c1c" }}>
                    {coupon.isActive ? "Active" : "Deactivated"}
                  </span>
                </div>

                <p style={{ margin: "6px 0", fontSize: "14px" }}>
                  <strong>Hotel:</strong> {coupon.hotelId?.hotelname || "Mapped Hotel"}
                </p>
                <p style={{ margin: "6px 0", fontSize: "14px" }}>
                  <strong>Discount:</strong> {coupon.discount} ({coupon.couponType === "percentage" ? "% Ratio Off" : "Flat Cash Value"})
                </p>
                <p style={{ margin: "6px 0", fontSize: "14px" }}>
                  <strong>Min Spend Limit:</strong> ₹{coupon.minPriceAvail || 0}
                </p>
                <p style={{ margin: "6px 0", fontSize: "12px", color: "#64748b" }}>
                  <strong>Valid From:</strong> {new Date(coupon.startingDate).toLocaleDateString()}
                </p>
                <p style={{ margin: "6px 0", fontSize: "12px", color: "#64748b" }}>
                  <strong>Valid Up To:</strong> {new Date(coupon.dateUpTo).toLocaleDateString()}
                </p>

                <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "12px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                  <button onClick={() => openEditMode(coupon)} style={{ flex: 1, padding: "6px", background: "#ffc107", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
                    Edit
                  </button>
                  <button onClick={() => toggleStatus(coupon._id, coupon.isActive)} style={{ flex: 1, padding: "6px", background: coupon.isActive ? "#6c757d" : "#0f766e", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}>
                    {coupon.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => handleDelete(coupon._id)} style={{ flex: 1, padding: "6px", background: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CouponManagement;
