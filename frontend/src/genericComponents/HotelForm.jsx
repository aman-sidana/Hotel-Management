import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function HotelForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const existingHotel = location.state?.hotelData || null;
  const isEditMode = !!existingHotel;

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  const [otp, setOtp] = useState("");
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [emailVerified, setEmailVerified] = useState(isEditMode); 
  const [loading, setLoading] = useState(false);

  // ✅ CHANGE: Added state to manage selected image files
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [form, setForm] = useState({
    hotelname: existingHotel?.hotelname || "",
    ownername: existingHotel?.ownername || "",
    ownerphone: existingHotel?.ownerphone || "",
    email: existingHotel?.email || "",
    stateId: existingHotel?.stateId || "",
    districtId: existingHotel?.districtId || "",
    cityId: existingHotel?.cityId || "",
    hoteladdress: existingHotel?.hoteladdress || "",
    totalrooms: existingHotel?.totalrooms || "",
  });

  useEffect(() => {
    getStates();
    getDistricts();
    getCities();
  }, []);

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
      [e.target.name]: e.target.value,
    });
  };

  // ✅ CHANGE: Function to capture files selected from input
  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const submitHotel = async () => {
    if (!emailVerified && !isEditMode) {
      return alert("Please verify your email address before submitting.");
    }

    // ✅ CHANGE: Build FormData structure to support binary file transfers
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    // Append each selected file onto the formData under the key 'images'
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      if (isEditMode) {
        // Form Data is also used during updates if changing pictures is supported
        await axios.patch(`http://localhost:1100/hotel/updaterequest?id=${existingHotel._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Hotel Request Updated Successfully");
      } else {
        // Send multipart data instead of typical JSON
        await axios.post("http://localhost:1100/hotel/hotelrequest", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Hotel Request Submitted Successfully");
      }

      setForm({
        hotelname: "",
        ownername: "",
        ownerphone: "",
        email: "",
        stateId: "",
        districtId: "",
        cityId: "",
        hoteladdress: "",
        totalrooms: "",
      });
      setSelectedFiles([]);
      setEmailVerified(false);

      navigate(isEditMode ? "/checkrequest" : "/");

    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const filteredDistricts = districts.filter(
    (district) => district.stateId?._id === form.stateId
  );

  const filteredCities = cities.filter(
    (city) => city.districtId?._id === form.districtId
  );

  return (
    <div className="hotel-form-container">
      <h2>{isEditMode ? "Update Hotel Registration" : "Hotel Registration"}</h2>

      <div>
        <button className="nav-check-btn" onClick={() => navigate("/checkrequest")}>
          Request Status
        </button>
      </div>

      <br />

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
        type="text"
        name="ownername"
        placeholder="Owner Name"
        value={form.ownername}
        onChange={handleChange}
        className="form-input"
      />
      <br /><br />

      <input
        type="number"
        name="ownerphone"
        placeholder="Owner Phone"
        value={form.ownerphone}
        onChange={handleChange}
        className="form-input"
      />
      <br /><br />

      <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="form-input"
          disabled={isEditMode || emailVerified}
          style={{ width: "250px" }}
        />
        {!isEditMode && (
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

      {showOtpBox && !emailVerified && (
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

      {emailVerified && !isEditMode && (
        <p style={{ color: "green", fontWeight: "bold", margin: "5px 0" }}>
          ✅ Email Verified Successfully
        </p>
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

      {/* ✅ CHANGE: Added multiple file selection input and showing file counts */}
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
        {selectedFiles.length > 0 && (
          <p style={{ fontSize: "14px", color: "#34495e", marginTop: "5px" }}>
            Selected: {selectedFiles.length} file(s)
          </p>
        )}
      </div>
      <br />

      <button 
        className="submit-btn" 
        onClick={submitHotel} 
        disabled={!emailVerified && !isEditMode}
      >
        {isEditMode ? "Update Request" : "Submit Request"}
      </button>
    </div>
  );
}

export default HotelForm;