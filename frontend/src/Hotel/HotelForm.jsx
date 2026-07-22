import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function HotelForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = JSON.parse(localStorage.getItem("currentuser")) || {};

  const isSuperAdmin = currentUser?.role?.toLowerCase() === "superadmin";
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  const existingHotel = location.state?.hotelData || null;
  const isEditMode = !!existingHotel;

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [otp, setOtp] = useState("");
  const [showOtpBox, setShowOtpBox] = useState(false);

  // ✅ ONLY SuperAdmin (or Edit Mode) bypasses Email Verification automatically.
  // Admins MUST verify through OTP!
  const [emailVerified, setEmailVerified] = useState(isEditMode || isSuperAdmin);
  const [loading, setLoading] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [form, setForm] = useState({
    hotelname: existingHotel?.hotelname || "",
    hotelphone: existingHotel?.hotelphone || "",
    email: existingHotel?.hotelemail || "",
    stateId: existingHotel?.stateId || "",
    districtId: existingHotel?.districtId || "",
    cityId: existingHotel?.cityId || "",
    hoteladdress: existingHotel?.hoteladdress || "",
    totalrooms: existingHotel?.totalrooms || "",
    totalstaff: existingHotel?.totalstaff || "",
    adminId: existingHotel?.adminId || (isAdmin ? currentUser?._id : ""),
  });

  useEffect(() => {
    getStates();
    getDistricts();
    getCities();
    if (isSuperAdmin) {
      getalladmin();
    }
  }, [isSuperAdmin]);

  const getalladmin = async () => {
    try {
      const result = await axios.get("http://localhost:1100/admin/alladmin");
      setAdmins(result.data);
    } catch (error) {
      console.log(error.response || error);
    }
  };

  const getStates = async () => {
    try {
      const result = await axios.get("http://localhost:1100/state/getstates");
      setStates(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getDistricts = async () => {
    try {
      const result = await axios.get("http://localhost:1100/district/getdistricts");
      setDistricts(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getCities = async () => {
    try {
      const result = await axios.get("http://localhost:1100/city/getcities");
      setCities(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const sendOTP = async () => {
    if (!form.email) {
      return alert("Please enter your email address first.");
    }
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:1100/hotel/sendhotelotp", {
        email: form.email,
      });
      alert(res.data.message);
      setShowOtpBox(true);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp) {
      return alert("Please enter the OTP sent to your email.");
    }
    try {
      const res = await axios.post("http://localhost:1100/hotel/verifyotp", {
        email: form.email,
        otp: otp,
      });
      alert(res.data.message);
      setEmailVerified(true);
      setShowOtpBox(false);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Invalid or Expired OTP");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.value ? e.target.name : e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const submitHotel = async () => {
    // 1. SUPER ADMIN FLOW (Direct Creation)
    if (isSuperAdmin && !isEditMode) {
      if (!form.adminId) {
        return alert("Please map an Admin to manage this hotel configuration.");
      }
      try {
        const payload = {
          hotelname: form.hotelname,
          hotelphone: form.hotelphone,
          hotelemail: form.email,
          stateId: form.stateId,
          districtId: form.districtId,
          cityId: form.cityId,
          hoteladdress: form.hoteladdress,
          totalrooms: form.totalrooms,
          totalstaff: form.totalstaff,
          adminId: form.adminId,
        };

        await axios.post("http://localhost:1100/hotel/super-admin-add", payload);
        alert("Hotel Registered & Pre-Approved Successfully!");

        setForm({
          hotelname: "", hotelphone: "", email: "", stateId: "",
          districtId: "", cityId: "", hoteladdress: "", totalrooms: "",
          totalstaff: "", adminId: "",
        });
        return navigate("/home");
      } catch (error) {
        console.log(error);
        return alert(error.response?.data?.message || "Superadmin creation flow failed");
      }
    }

    // 2. ADMIN & USER SUBMISSION FLOW (Requires OTP Verification & SuperAdmin Approval)
    if (!emailVerified && !isEditMode) {
      return alert("Please verify your email address via OTP before submitting.");
    }

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (key === "email") {
        formData.append("hotelemail", form.email);
      } else {
        formData.append(key, form[key]);
      }
    });

    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      if (isEditMode) {
        await axios.patch(`http://localhost:1100/hotel/updaterequest?id=${existingHotel._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Hotel Request Updated Successfully");
      } else {
        await axios.post("http://localhost:1100/hotel/hotelrequest", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Hotel Request Submitted Successfully! Awaiting SuperAdmin Approval.");
      }

      setForm({
        hotelname: "", hotelphone: "", email: "", stateId: "",
        districtId: "", cityId: "", hoteladdress: "", totalrooms: "",
        totalstaff: "", adminId: "",
      });
      setSelectedFiles([]);
      setEmailVerified(false);
      navigate("/home");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Something went wrong submitting hotel request.");
    }
  };

  const filteredDistricts = districts.filter(
    (district) => district.stateId?._id === form.stateId
  );

  const filteredCities = cities.filter(
    (city) => city.districtId?._id === form.districtId
  );

  return (
    <div className="hotel-form-container app-page app-page--form">
      <h2>{isEditMode ? "Update Hotel Registration" : "Hotel Registration"}</h2>

      <div>
        <button className="nav-check-btn" onClick={() => navigate("/checkrequest")}>
          Request Status
        </button>
      </div>

      <br />

      {/* Admin assignment dropdown shown ONLY for SuperAdmin */}
      {isSuperAdmin && (
        <>
          <select
            name="adminId"
            value={form.adminId}
            onChange={handleChange}
            className="form-select"
            style={{ border: "2px solid #0d6efd" }}
          >
            <option value="">-- Assign Responsible Admin Manager --</option>
            {admins.map((admin) => (
              <option key={admin._id} value={admin._id}>
                {admin.adminname} ({admin.email})
              </option>
            ))}
          </select>
          <br /><br />
        </>
      )}

      <input
        type="text"
        name="hotelname"
        placeholder="Hotel Name"
        value={form.hotelname}
        onChange={handleChange}
        className="form-input"
      />
      <br /><br />

      <input
        type="number"
        name="hotelphone"
        placeholder="Hotel Phone Number"
        value={form.hotelphone}
        onChange={handleChange}
        className="form-input"
      />
      <br /><br />

      {/* Email Input & Verify Button */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
        <input
          type="email"
          name="email"
          placeholder="Hotel Email"
          value={form.email}
          onChange={handleChange}
          className="form-input"
          disabled={isEditMode || emailVerified}
          style={{ width: "250px" }}
        />

        {/* ✅ Show "Verify Email" button for everyone EXCEPT SuperAdmin */}
        {!isEditMode && !isSuperAdmin && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={sendOTP}
            disabled={emailVerified || loading}
          >
            {emailVerified ? "Verified ✅" : loading ? "Sending..." : "Verify Email"}
          </button>
        )}
      </div>
      <br />

      {/* ✅ OTP Input Box for Admin / Users */}
      {showOtpBox && !emailVerified && !isSuperAdmin && (
        <div style={{ margin: "10px 0", display: "flex", gap: "10px", justifyContent: "center" }}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="form-input"
            style={{ width: "150px" }}
          />
          <button type="button" className="btn btn-secondary" onClick={verifyOTP}>
            Verify OTP
          </button>
        </div>
      )}

      <select
        name="stateId"
        value={form.stateId}
        onChange={handleChange}
        className="form-select"
      >
        <option value="">Select State</option>
        {states.map((state) => (
          <option key={state._id} value={state._id}>
            {state.stateName}
          </option>
        ))}
      </select>
      <br /><br />

      <select
        name="districtId"
        value={form.districtId}
        onChange={handleChange}
        className="form-select"
      >
        <option value="">Select District</option>
        {filteredDistricts.map((district) => (
          <option key={district._id} value={district._id}>
            {district.districtName}
          </option>
        ))}
      </select>
      <br /><br />

      <select
        name="cityId"
        value={form.cityId}
        onChange={handleChange}
        className="form-select"
      >
        <option value="">Select City</option>
        {filteredCities.map((city) => (
          <option key={city._id} value={city._id}>
            {city.cityName}
          </option>
        ))}
      </select>
      <br /><br />

      <textarea
        name="hoteladdress"
        placeholder="Hotel Address"
        value={form.hoteladdress}
        onChange={handleChange}
        className="form-textarea"
      />
      <br /><br />

      <input
        type="number"
        name="totalrooms"
        placeholder="Total Rooms"
        value={form.totalrooms}
        onChange={handleChange}
        className="form-input"
      />
      <br /><br />

      <input
        type="text"
        name="totalstaff"
        placeholder="Total Staff Counter"
        value={form.totalstaff}
        onChange={handleChange}
        className="form-input"
      />
      <br /><br />

      <div className="file-input-container" style={{ margin: "15px 0" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
          Upload Hotel Images:
        </label>
        <input
          type="file"
          name="images"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="form-input"
        />
      </div>
      <br />

      <button
        className="submit-btn"
        onClick={submitHotel}
        disabled={!emailVerified && !isEditMode && !isSuperAdmin}
      >
        {isEditMode ? "Update Request" : "Submit Request"}
      </button>
    </div>
  );
}

export default HotelForm;
