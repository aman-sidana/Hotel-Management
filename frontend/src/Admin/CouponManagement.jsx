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
    fetchCoupons(); allhotel();
  }, []);

  const allhotel = async () => {
    try {
      const result = await axios.get("http://localhost:1100/hotel/allhotels");
      setHotel(Array.isArray(result.data) ? result.data : result.data.result || []);
    } catch (error) { console.log(error.response || error); }
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:1100/coupon/getallcoupon");
      setCoupons(res.data.result || []);
    } catch (error) {
      console.error("Error fetching coupons:", error); setCoupons([]);
    } finally { setLoading(false); }
  };

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) { setSelectedFile(e.target.files[0]); }
  };

  const openEditMode = (coupon) => {
    setIsEditMode(true); setEditingId(coupon._id);
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
    setShowForm(false); setIsEditMode(false); setEditingId(null); setSelectedFile(null);
    setForm({ hotelId: "", couponCode: "", couponType: "flat", discount: "", minPriceAvail: "", startingDate: "", dateUpTo: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach((key) => { formData.append(key, form[key]); });
    if (selectedFile) { formData.append("images", selectedFile); }

    try {
      if (isEditMode) {
        await axios.put(`http://localhost:1100/coupon/updatecoupon?id=${editingId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        alert("Coupon Updated Successfully");
      } else {
        await axios.post("http://localhost:1100/coupon/addcoupon", formData, { headers: { "Content-Type": "multipart/form-data" } });
        alert("Coupon Added Successfully");
      }
      closeForm(); fetchCoupons();
    } catch (error) {
      console.error(error); alert(error.response?.data?.message || "Something went wrong saving the coupon.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:1100/coupon/deletecoupon?id=${id}`);
      alert("Coupon deleted successfully"); fetchCoupons();
    } catch (error) { console.error(error); alert("Failed to delete coupon"); }
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
    } catch (error) { console.error(error); alert("Failed to alter coupon status"); }
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
    if (sortBy === "codeAsc") return (a.couponCode || "").localeCompare(b.couponCode || "");
    else if (sortBy === "codeDesc") return (b.couponCode || "").localeCompare(a.couponCode || "");
    else if (sortBy === "discountAsc") return Number(a.discount || 0) - Number(b.discount || 0);
    else if (sortBy === "discountDesc") return Number(b.discount || 0) - Number(a.discount || 0);
    return 0;
  });

  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5";

  return (
    <div className="management-module">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-sky-400">
          Coupon Management
        </h2>
        <button
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${showForm ? "btn-action-secondary" : "btn-action-primary"}`}
          onClick={showForm ? closeForm : () => setShowForm(true)}
        >
          {showForm ? "✕ Close Form" : "+ Add Coupon"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="admin-inline-form mb-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">
            {isEditMode ? "Edit Coupon Details" : "Create Promotional Coupon"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Select Hotel</label>
              <select name="hotelId" required value={form.hotelId} onChange={handleChange} className="form-select w-full">
                <option value="">-- Select a Hotel --</option>
                {hotel.map((h) => <option key={h._id} value={h._id}>{h.hotelname} ({h.hotelemail || h.hotelphone})</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Coupon Code</label>
              <input type="text" name="couponCode" required value={form.couponCode} onChange={handleChange} className="form-input w-full" placeholder="e.g. SAVE50" />
            </div>
            <div>
              <label className={labelClass}>Coupon Type</label>
              <select name="couponType" value={form.couponType} onChange={handleChange} className="form-select w-full">
                <option value="flat">Flat Discount</option>
                <option value="percentage">Percentage Discount</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Discount Value</label>
              <input type="number" name="discount" required value={form.discount} onChange={handleChange} className="form-input w-full" placeholder="e.g. 200" />
            </div>
            <div>
              <label className={labelClass}>Min Price Threshold</label>
              <input type="number" name="minPriceAvail" value={form.minPriceAvail} onChange={handleChange} className="form-input w-full" placeholder="Minimum order amount" />
            </div>
            <div>
              <label className={labelClass}>Advertisement Image</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="form-input w-full" />
            </div>
            <div>
              <label className={labelClass}>Validity Starting Date</label>
              <input type="date" name="startingDate" required value={form.startingDate} onChange={handleChange} className="form-input w-full" />
            </div>
            <div>
              <label className={labelClass}>Expiration Date</label>
              <input type="date" name="dateUpTo" required value={form.dateUpTo} onChange={handleChange} className="form-input w-full" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-action-success">{isEditMode ? "Save Changes" : "Create Coupon"}</button>
            <button type="button" className="btn-action-secondary" onClick={closeForm}>Cancel</button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap mb-5">
        <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "active" ? "bg-blue-600 text-white" : "btn-action-secondary"}`} onClick={() => setActiveTab("active")}>Active Coupons</button>
        <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "inactive" ? "bg-blue-600 text-white" : "btn-action-secondary"}`} onClick={() => setActiveTab("inactive")}>Inactive Coupons</button>
        <select className="form-select ml-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="codeAsc">Code (A - Z)</option>
          <option value="codeDesc">Code (Z - A)</option>
          <option value="discountAsc">Discount (Low - High)</option>
          <option value="discountDesc">Discount (High - Low)</option>
        </select>
        <input type="text" className="form-input w-52" placeholder="Search Code or Hotel..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {/* Coupon Cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">Loading coupons...</div>
      ) : displayedCoupons.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          No {activeTab === "active" ? "Active" : "Inactive"} coupons found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedCoupons.map((coupon) => (
            <div key={coupon._id} className={`admin-card ${!coupon.isActive ? "inactive" : ""}`}>
              <div className="h-36 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                {coupon.couponImages ? (
                  <img src={coupon.couponImages} alt="Promo Banner" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 text-sm">No Promo Image</span>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-bold text-base text-blue-600 dark:text-blue-400 tracking-wide">{coupon.couponCode}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${coupon.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {[
                  ["Hotel", coupon.hotelId?.hotelname || "N/A"],
                  ["Discount", `${coupon.discount} (${coupon.couponType === "percentage" ? "% Off" : "Flat"})`],
                  ["Min Spend", `₹${coupon.minPriceAvail || 0}`],
                  ["Valid From", new Date(coupon.startingDate).toLocaleDateString()],
                  ["Expires", new Date(coupon.dateUpTo).toLocaleDateString()],
                ].map(([label, value]) => (
                  <p key={label} className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{label}:</span> {value}
                  </p>
                ))}

                <hr className="my-3 border-slate-100 dark:border-slate-700" />

                <div className="flex gap-2">
                  <button className="flex-1 btn-action-secondary text-center" onClick={() => openEditMode(coupon)}>Edit</button>
                  <button className={`flex-1 text-center ${coupon.isActive ? "btn-action-warning" : "btn-action-success"}`} onClick={() => toggleStatus(coupon._id, coupon.isActive)}>
                    {coupon.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button className="flex-1 btn-action-danger text-center" onClick={() => handleDelete(coupon._id)}>Delete</button>
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