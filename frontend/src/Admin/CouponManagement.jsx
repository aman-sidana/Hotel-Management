import React, { useEffect, useState } from "react";
import axios from "axios";

function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [hotel, setHotel] = useState([]);

  const [activeTab, setActiveTab] = useState("active");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("codeAsc");

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

  const tabFilteredCoupons = coupons.filter((coupon) => {
    if (activeTab === "active") return coupon.isActive === true;
    if (activeTab === "inactive") return coupon.isActive === false;
    return true;
  });

  const searchedCoupons = tabFilteredCoupons.filter((coupon) => {
    const q = searchQuery.toLowerCase();
    const codeMatch = coupon.couponCode ? coupon.couponCode.toLowerCase().includes(q) : false;
    const hotelMatch = coupon.hotelId?.hotelname ? coupon.hotelId.hotelname.toLowerCase().includes(q) : false;
    return codeMatch || hotelMatch;
  });

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
    <div className="app-page app-page--management" style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Coupon Configuration Management</h2>
        <button
          className={showForm ? "btn btn-secondary" : "btn btn-primary"}
          onClick={showForm ? closeForm : () => setShowForm(true)}
        >
          {showForm ? "Close Form" : "Add New Coupon"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-inline-form">
          <h3>{isEditMode ? "Edit Coupon Details" : "Create Promotional Coupon Entry"}</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Select Hotel</label>
              <select
                name="hotelId"
                required
                value={form.hotelId}
                onChange={handleChange}
                style={{ width: "100%", boxSizing: "border-box" }}
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
              <input type="text" name="couponCode" required value={form.couponCode} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Coupon Type</label>
              <select name="couponType" value={form.couponType} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box" }}>
                <option value="flat">Flat Discount</option>
                <option value="percentage">Percentage Discount</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Discount Value</label>
              <input type="number" name="discount" required value={form.discount} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Min Price Available Threshold</label>
              <input type="number" name="minPriceAvail" value={form.minPriceAvail} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Display Advertisement Image</label>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ width: "100%", marginTop: "5px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Validity Starting Date</label>
              <input type="date" name="startingDate" required value={form.startingDate} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Expiration Threshold Date (Up To)</label>
              <input type="date" name="dateUpTo" required value={form.dateUpTo} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" className="btn" style={{ background: "var(--success)", color: "#fff", padding: "10px 20px", fontWeight: "bold" }}>
              {isEditMode ? "Save Parameter Changes" : "Deploy Coupon Registry"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={closeForm} style={{ padding: "10px 20px" }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="filter-buttons">
        <button
          className={`btn ${activeTab === "active" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("active")}
        >
          Active Coupons
        </button>
        <button
          className={`btn ${activeTab === "inactive" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("inactive")}
        >
          Inactive Coupons
        </button>

        <select
          className="form-input"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ marginLeft: "auto", width: "200px" }}
        >
          <option value="codeAsc">Code (A - Z)</option>
          <option value="codeDesc">Code (Z - A)</option>
          <option value="discountAsc">Discount (Low to High)</option>
          <option value="discountDesc">Discount (High to Low)</option>
        </select>

        <input
          type="text"
          className="form-input"
          placeholder="Search Code or Hotel..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "200px" }}
        />
      </div>

      {loading ? (
        <p>Loading active promotional indexes...</p>
      ) : displayedCoupons.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "30px" }}>
          No {activeTab === "active" ? "Active" : "Inactive"} coupons found.
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {displayedCoupons.map((coupon) => (
            <div key={coupon._id} className={`admin-card ${!coupon.isActive ? "inactive" : ""}`}>
              <div className="admin-card-image">
                {coupon.couponImages ? (
                  <img src={coupon.couponImages} alt="Promo Banner" />
                ) : (
                  <span>No Advert Image Uploaded</span>
                )}
              </div>

              <div className="admin-card-body">
                <div className="admin-card-header">
                  <span className="admin-badge success">{coupon.couponCode}</span>
                  <span className={`admin-badge ${coupon.isActive ? "success" : "danger"}`}>
                    {coupon.isActive ? "Active" : "Deactivated"}
                  </span>
                </div>

                <p className="admin-card-detail">
                  <strong>Hotel:</strong> {coupon.hotelId?.hotelname || "Mapped Hotel"}
                </p>
                <p className="admin-card-detail">
                  <strong>Discount:</strong> {coupon.discount} ({coupon.couponType === "percentage" ? "% Ratio Off" : "Flat Cash Value"})
                </p>
                <p className="admin-card-detail">
                  <strong>Min Spend Limit:</strong> ₹{coupon.minPriceAvail || 0}
                </p>
                <p className="admin-card-detail">
                  <strong>Valid From:</strong> {new Date(coupon.startingDate).toLocaleDateString()}
                </p>
                <p className="admin-card-detail">
                  <strong>Valid Up To:</strong> {new Date(coupon.dateUpTo).toLocaleDateString()}
                </p>

                <hr className="admin-card-divider" />

                <div className="admin-card-actions-row">
                  <button className="admin-action-btn edit" onClick={() => openEditMode(coupon)}>
                    Edit
                  </button>
                  <button
                    className={`admin-action-btn ${coupon.isActive ? "deactivate" : "activate"}`}
                    onClick={() => toggleStatus(coupon._id, coupon.isActive)}
                  >
                    {coupon.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button className="admin-action-btn delete" onClick={() => handleDelete(coupon._id)}>
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