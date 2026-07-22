import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function AdminForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = JSON.parse(localStorage.getItem("currentuser"));
  const isSuperAdmin = currentUser?.role === "superadmin";

  const existingAdmin = location.state?.adminData || null;
  const isEditMode = !!existingAdmin;

  const [otp, setOtp] = useState("");
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [emailVerified, setEmailVerified] = useState(isEditMode);
  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null); // single file handle karne k liye 

  const [form, setForm] = useState({
    adminname: existingAdmin?.adminname || "",
    adminphone: existingAdmin?.adminphone || "",
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
      const res = await axios.post("http://localhost:1100/admin/send-otp", {
        email: form.email,
      });
      alert(res.data.message || "OTP Sent successfully");
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
      const res = await axios.post("http://localhost:1100/admin/verify-otp", {
        email: form.email,
        otp: otp,
      });
      alert(res.data.message || "OTP Verified");
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

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  }
  const submitAdmin = async () => {
    try {
      if (isSuperAdmin) {

        await axios.post(
          "http://localhost:1100/admin/super-admin-add",
          {
            adminname: form.adminname,
            adminphone: form.adminphone,
            email: form.email,
            permanentaddress: form.permanentaddress,
            currentaddress: form.currentaddress,
          }
        );

        alert("Admin Added Successfully");

        setForm({
          adminname: "",
          adminphone: "",
          email: "",
          permanentaddress: "",
          currentaddress: "",
        });

        setSelectedFile(null);
        setEmailVerified(false);
        setShowOtpBox(false);
        setOtp("");

        navigate("/home");

        return;
      }

      // ===========================
      // NORMAL ADMIN FLOW
      // ===========================

      if (!emailVerified && !isEditMode) {
        return alert("Please verify your email first.");
      }

      const formData = new FormData();

      formData.append("adminname", form.adminname);
      formData.append("adminphone", form.adminphone);
      formData.append("email", form.email);
      formData.append("permanentaddress", form.permanentaddress);
      formData.append("currentaddress", form.currentaddress);

      if (selectedFile) {
        formData.append("images", selectedFile);
      }

      if (isEditMode) {

        await axios.patch(
          `http://localhost:1100/admin/update?id=${existingAdmin._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        alert("Admin Updated Successfully");

        navigate("/checkaddminrequest");

      } else {

        await axios.post(
          "http://localhost:1100/admin/submit-request",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        alert("Request Submitted Successfully");

        navigate("/");
      }

      setForm({
        adminname: "",
        adminphone: "",
        email: "",
        permanentaddress: "",
        currentaddress: "",
      });

      setSelectedFile(null);
      setEmailVerified(false);
      setShowOtpBox(false);
      setOtp("");

    } catch (error) {

      console.log(error);

      alert(error.response?.data?.message || "Something went wrong");
    }
  };



  return (
    <div className="hotel-form-container app-page app-page--form">
      <h2>{isEditMode ? "Update Admin Registration" : "Admin Registration"}</h2>

      <div>
        <button className="nav-check-btn" onClick={() => navigate("/checkaddminrequest")}>
          Request Status
        </button>
      </div>

      <br />

      <input
        type="text"
        name="adminname"
        placeholder="Admin Full Name"
        value={form.adminname}
        onChange={handleChange}
        className="form-input"
      />
      <br /><br />

      <input
        type="number"
        name="adminphone"
        placeholder="Admin Phone Number"
        value={form.adminphone}
        onChange={handleChange}
        className="form-input"
      />
      <br /><br />

      <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
        <input
          type="email"
          name="email"
          placeholder="Admin Email Address"
          value={form.email}
          onChange={handleChange}
          className="form-input"
          disabled={isEditMode || emailVerified}
          style={{ width: "250px" }}
        />
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

      {emailVerified && !isEditMode && !isSuperAdmin && (
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

      <textarea
        name="currentaddress"
        placeholder="Current Address"
        value={form.currentaddress}
        onChange={handleChange}
        className="form-textarea"
      />
      <br /><br />

      <div className="file-input-container" style={{ margin: "15px 0" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
          Upload Owner Image Profile:
        </label>
        <input
          type="file"
          name="images"
          accept="image/*"
          onChange={handleFileChange}
          className="form-input"
        />
        {selectedFile && (
          <p style={{ fontSize: "14px", color: "#34495e", marginTop: "5px" }}>
            Selected: {selectedFile.name}
          </p>
        )}
      </div>
      <br />

      <button
        className="submit-btn"
        onClick={submitAdmin}
        disabled={!isSuperAdmin && !emailVerified && !isEditMode}
      >
        {isEditMode ? "Update Request" : "Submit Request"}
      </button>
    </div>
  );
}

export default AdminForm;
