import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function AdminForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const existingAdmin = location.state?.adminData || null;
  const isEditMode = !!existingAdmin;

  const [otp, setOtp] = useState("");
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [emailVerified, setEmailVerified] = useState(isEditMode);
  const [loading, setLoading] = useState(false);

  // States to hold file states before upload
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [validProofFile, setValidProofFile] = useState(null);

  // Core schema text state parameters
  const [form, setForm] = useState({
    ownername: existingAdmin?.ownername || "",
    ownerphone: existingAdmin?.ownerphone || "",
    email: existingAdmin?.email || "",
    permanentaddress: existingAdmin?.permanentaddress || "",
    currentaddress: existingAdmin?.currentaddress || "",
  });

  const sendOTP = async () => {
    if (!form.email) {
      return alert("Please enter your email address first.");
    }
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:1100/admin/sendotp", {
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
      const res = await axios.post("http://localhost:1100/admin/verifyotp", {
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

  const submitAdmin = async () => {
    if (!emailVerified && !isEditMode) {
      return alert("Please verify your email address before submitting.");
    }

    try {
      let profileimageUrl = existingAdmin?.profileimage || "";
      let addharUrls = existingAdmin?.addhar || [];

      // Step 1: Upload Profile Image separately if selected
      if (profileImageFile) {
        const profileData = new FormData();
        profileData.append("image", profileImageFile);

        const profileRes = await axios.post("http://localhost:1100/admin/upload-single", profileData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        profileimageUrl = profileRes.data.url;
      }

      // Step 2: Upload Proof Document / Aadhaar image separately if selected
      if (validProofFile) {
        const aadharData = new FormData();
        aadharData.append("image", validProofFile);

        const aadharRes = await axios.post("http://localhost:1100/admin/upload-single", aadharData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        addharUrls = [aadharRes.data.url];
      }

      // Step 3: Compile into a standard application/json text configuration payload
      const finalJsonPayload = {
        ...form,
        profileimage: profileimageUrl,
        addhar: addharUrls
      };

      if (isEditMode) {
        await axios.patch(`http://localhost:1100/admin/updaterequest?id=${existingAdmin._id}`, finalJsonPayload, {
          headers: { "Content-Type": "application/json" }
        });
        alert("Admin Request Updated Successfully");
      } else {
        await axios.post("http://localhost:1100/admin/adminrequest", finalJsonPayload, {
          headers: { "Content-Type": "application/json" }
        });
        alert("Admin Request Submitted Successfully");
      }

      // Clear structural state parameters safely
      setForm({
        ownername: "",
        ownerphone: "",
        email: "",
        permanentaddress: "",
        currentaddress: "",
      });
      setProfileImageFile(null);
      setValidProofFile(null);
      setEmailVerified(false);

      navigate(isEditMode ? "/checkadminrequest" : "/");

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Something went wrong during submission");
    }
  };

  return (
    <div className="admin-form-container">
      <h2>{isEditMode ? "Update Admin Registration" : "Admin Registration"}</h2>

      <div>
        <button className="nav-check-btn" onClick={() => navigate("/checkadminrequest")}>
          Request Status
        </button>
      </div>

      <br />

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
          placeholder="Email Address"
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

      <textarea
        name="permanentaddress"
        placeholder="Permanent Address"
        value={form.permanentaddress}
        onChange={handleChange}
        className="form-textarea"
      />
      <br /><br />

      <input
        type="number"
        name="currentaddress"
        placeholder="Current Address Identifier"
        value={form.currentaddress}
        onChange={handleChange}
        className="form-input"
      />
      <br /><br />

      <div className="file-input-container" style={{ margin: "15px 0" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
          Upload Profile Image:
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfileImageFile(e.target.files[0])}
          className="form-input"
        />
        {profileImageFile && (
          <p style={{ fontSize: "14px", color: "#2c3e50", marginTop: "5px" }}>
            Selected: {profileImageFile.name}
          </p>
        )}
      </div>
      <br />

      <div className="file-input-container" style={{ margin: "15px 0" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
          Upload Valid Proof Document / Identity Card:
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setValidProofFile(e.target.files[0])}
          className="form-input"
        />
        {validProofFile && (
          <p style={{ fontSize: "14px", color: "#2c3e50", marginTop: "5px" }}>
            Selected: {validProofFile.name}
          </p>
        )}
      </div>
      <br />

      <button
        className="submit-btn"
        onClick={submitAdmin}
        disabled={!emailVerified && !isEditMode}
      >
        {isEditMode ? "Update Request" : "Submit Request"}
      </button>
    </div>
  );
}

export default AdminForm;