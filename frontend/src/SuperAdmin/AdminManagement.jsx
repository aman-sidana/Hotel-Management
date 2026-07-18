import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // States for handling the Rejection Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    getAdmins();
  }, []);

  const getAdmins = async () => {
    try {
      const result = await axios.get("http://localhost:1100/admin/alladmin");
      setAdmins(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const viewAdmin = async (id) => {
    try {
      const result = await axios.get(
        `http://localhost:1100/admin/viewdetails?id=${id}`
      );
      setSelectedAdmin(result.data.admin);
      setShowModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  const approveAdmin = async (id) => {
    try {
      await axios.patch(`http://localhost:1100/admin/approverequest?id=${id}`);
      getAdmins();
    } catch (error) {
      console.log(error);
    }
  };

  const openRejectModal = (id) => {
    setRejectingId(id);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    try {
      await axios.patch(`http://localhost:1100/admin/rejectrequest?id=${rejectingId}`, {
        description: rejectReason 
      });
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectReason("");
      getAdmins();
    } catch (error) {
      console.log(error);
    }
  };

  const softDeleteAdmin = async (id) => {
    try {
      await axios.patch(`http://localhost:1100/admin/softdelete?id=${id}`);
      getAdmins();
    } catch (error) {
      console.log(error);
    }
  };

  const restoreAdmin = async (id) => {
    try {
      await axios.patch(`http://localhost:1100/admin/restore?id=${id}`);
      getAdmins();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteAdmin = async (id) => {
    if (!window.confirm("Permanently delete this admin record?")) return;
    try {
      await axios.delete(`http://localhost:1100/admin/deleteadmin?id=${id}`);
      getAdmins();
    } catch (error) {
      console.log(error);
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    switch (activeTab) {
      case "pending":
        return admin.status === "pending" && admin.isActive;
      case "approved":
        return admin.status === "approved" && admin.isActive;
      case "rejected":
        return admin.status === "rejected" && admin.isActive;
      case "inactive": 
        return admin.isActive === false;
      case "active":   
        return admin.isActive === true;
      default:
        return true;
    }
  });

  return (
    <div className="hotel-management-container"> {/* Keeps your shared form/table css styling */}
      <h2>Admin Portal Management</h2>

      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Requests
        </button>

        <button
          className={`tab-btn ${activeTab === "approved" ? "active" : ""}`}
          onClick={() => setActiveTab("approved")}
        >
          Approved Admins
        </button>

        <button
          className={`tab-btn ${activeTab === "rejected" ? "active" : ""}`}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected Requests
        </button>

        <button
          className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Active Admins
        </button>

        <button
          className={`tab-btn ${activeTab === "inactive" ? "active" : ""}`}
          onClick={() => setActiveTab("inactive")}
        >
          Inactive Admins
        </button>
      </div>

      <table className="hotel-table">
        <thead>
          <tr>
            <th>Owner Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredAdmins.map((admin) => (
            <tr key={admin._id}>
              <td>{admin.ownername}</td>
              <td>{admin.email}</td>
              <td>{admin.ownerphone}</td>
              <td>
                <div className="action-buttons">
                  {activeTab === "pending" && (
                    <div>
                      <button className="btn-action btn-approve" onClick={() => viewAdmin(admin._id)}>
                        View Details
                      </button>
                      <button className="btn-action btn-approve" onClick={() => approveAdmin(admin._id)}>
                        Approve
                      </button>
                      <button className="btn-action btn-reject" onClick={() => openRejectModal(admin._id)}>
                        Reject
                      </button>
                    </div>
                  )}

                  {(activeTab === "approved" || activeTab === "active") && (
                    <div>
                      <button className="btn-action btn-warning" onClick={() => softDeleteAdmin(admin._id)}>
                        Make Inactive
                      </button>
                      <button className="btn-action btn-delete" onClick={() => deleteAdmin(admin._id)}>
                        Delete
                      </button>
                    </div>
                  )}

                  {activeTab === "rejected" && (
                    <div>
                      <button className="btn-action btn-approve" onClick={() => approveAdmin(admin._id)}>
                        Approve
                      </button>
                      <button className="btn-action btn-delete" onClick={() => deleteAdmin(admin._id)}>
                        Delete
                      </button>
                    </div>
                  )}

                  {activeTab === "inactive" && (
                    <div>
                      <button className="btn-action btn-restore" onClick={() => restoreAdmin(admin._id)}>
                        Make Active
                      </button>
                      <button className="btn-action btn-delete" onClick={() => deleteAdmin(admin._id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {filteredAdmins.length === 0 && (
            <tr>
              <td colSpan="4" align="center" style={{ padding: "30px", color: "#7f8c8d" }}>
                No Admin Records Found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Admin Details Modal */}
      {showModal && selectedAdmin && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Admin Profile Details</h2>

            <p><strong>Owner Name:</strong> {selectedAdmin.ownername}</p>
            <p><strong>Phone:</strong> {selectedAdmin.ownerphone}</p>
            <p><strong>Email Address:</strong> {selectedAdmin.email}</p>
            <p><strong>Permanent Address:</strong> {selectedAdmin.permanentaddress}</p>
            <p><strong>Current Address ID:</strong> {selectedAdmin.currentaddress}</p>
            <p><strong>Admin Request ID:</strong> {selectedAdmin.AdminRequestId}</p>

            <p>
              <strong>Status:</strong>
              <span
                style={{
                  color:
                    selectedAdmin.status === "approved"
                      ? "green"
                      : selectedAdmin.status === "rejected"
                        ? "red"
                        : "orange",
                  marginLeft: "10px"
                }}
              >
                {selectedAdmin.status}
              </span>
            </p>

            {selectedAdmin.description && (
              <p>
                <strong>Rejection/Note Description:</strong>{" "}
                {selectedAdmin.description}
              </p>
            )}

            {/* Document Render Section */}
            <div style={{ display: "flex", gap: "20px", marginTop: "15px", flexWrap: "wrap" }}>
              {selectedAdmin.profileimage && (
                <div>
                  <p><strong>Profile Image:</strong></p>
                  <img 
                    src={selectedAdmin.profileimage} 
                    alt="Profile" 
                    style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "4px", border: "1px solid #ccc" }}
                  />
                </div>
              )}
              {selectedAdmin.addhar && selectedAdmin.addhar.length > 0 && (
                <div>
                  <p><strong>Proof / Aadhar Verification Document:</strong></p>
                  <img 
                    src={selectedAdmin.addhar[0]} 
                    alt="Proof" 
                    style={{ width: "160px", height: "120px", objectFit: "contain", borderRadius: "4px", border: "1px solid #ccc" }}
                  />
                </div>
              )}
            </div>

            <br />
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedAdmin(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Reject Administration Request</h2>
            <p style={{ color: "#e74c3c" }}>Please provide a reason for rejecting this administrative profile entry:</p>
            
            <textarea
              className="form-textarea"
              placeholder="Enter rejection logs or parameter details here..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: "100%", height: "120px", marginTop: "10px", padding: "10px", boxSizing: "border-box" }}
            />

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                className="btn-action btn-reject"
                onClick={confirmReject}
              >
                Confirm Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingId(null);
                  setRejectReason("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagement;