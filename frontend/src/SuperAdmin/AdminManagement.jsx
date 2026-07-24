import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminManagement() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("nameAsc");

  useEffect(() => { getAdmins(); }, []);

  const getAdmins = async () => {
    try {
      const result = await axios.get("http://localhost:1100/admin/alladmin");
      setAdmins(result.data);
    } catch (error) { console.log(error); }
  };

  const viewAdmin = async (id) => {
    try {
      const result = await axios.get(`http://localhost:1100/admin/details?id=${id}`);
      setSelectedAdmin(result.data.data);
      setShowModal(true);
    } catch (error) { console.log(error); }
  };

  const approveAdmin = async (id) => {
    try {
      await axios.patch(`http://localhost:1100/admin/approve?id=${id}`);
      getAdmins();
    } catch (error) { console.log(error.response); }
  };

  const openRejectModal = (id) => {
    setRejectingId(id); setRejectReason(""); setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) { alert("Please provide a reason for rejection."); return; }
    try {
      await axios.patch(`http://localhost:1100/admin/reject?id=${rejectingId}`, { description: rejectReason });
      setShowRejectModal(false); setRejectingId(null); setRejectReason(""); getAdmins();
    } catch (error) { console.log(error); }
  };

  const softDeleteAdmin = async (id) => {
    try { await axios.patch(`http://localhost:1100/admin/soft-delete?id=${id}`); getAdmins(); } catch (error) { console.log(error); }
  };

  const restoreAdmin = async (id) => {
    try { await axios.patch(`http://localhost:1100/admin/restore?id=${id}`); getAdmins(); } catch (error) { console.log(error); }
  };

  const deleteAdmin = async (id) => {
    if (!window.confirm("Permanently delete this admin record?")) return;
    try { await axios.delete(`http://localhost:1100/admin/delete?id=${id}`); getAdmins(); } catch (error) { console.log(error); }
  };

  const filteredAdmins = admins.filter((admin) => {
    switch (activeTab) {
      case "pending": return admin.status === "pending" && admin.isActive;
      case "approved": return admin.status === "approved" && admin.isActive;
      case "rejected": return admin.status === "rejected" && admin.isActive;
      case "inactive": return admin.isActive === false;
      case "active": return admin.isActive === true;
      default: return true;
    }
  });

  const searchedAdmins = filteredAdmins.filter((item) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = item.adminname ? item.adminname.toLowerCase().includes(q) : false;
    const emailMatch = item.email ? item.email.toLowerCase().includes(q) : false;
    const phoneMatch = item.adminphone ? item.adminphone.toString().toLowerCase().includes(q) : false;
    return nameMatch || emailMatch || phoneMatch;
  });

  const displayedAdmins = [...searchedAdmins].sort((a, b) => {
    if (sortBy === "nameAsc") return (a.adminname || "").localeCompare(b.adminname || "");
    else if (sortBy === "nameDesc") return (b.adminname || "").localeCompare(a.adminname || "");
    else if (sortBy === "emailAsc") return (a.email || "").localeCompare(b.email || "");
    else if (sortBy === "emailDesc") return (b.email || "").localeCompare(a.email || "");
    return 0;
  });

  const tabs = [
    { id: "pending", label: "🕐 Pending" },
    { id: "approved", label: "✅ Approved" },
    { id: "rejected", label: "❌ Rejected" },
    { id: "active", label: "🟢 Active" },
    { id: "inactive", label: "⭕ Inactive" },
  ];

  return (
    <div className="management-module">
      <div className="flex items-center justify-between mb-5">
        <h2 className="mb-0">Admin Portal Management</h2>
        <button
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all duration-200"
          onClick={() => navigate("/adminform")}
        >
          + Add Admin
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab.id ? "bg-blue-600 text-white" : "btn-action-secondary"}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3 items-center flex-wrap mb-5">
        <select className="form-select ml-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="nameAsc">Name (A - Z)</option>
          <option value="nameDesc">Name (Z - A)</option>
          <option value="emailAsc">Email (A - Z)</option>
          <option value="emailDesc">Email (Z - A)</option>
        </select>
        <input type="text" className="form-input w-44" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="table-container">
        <table className="hotel-table">
          <thead>
            <tr>
              <th>Owner Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedAdmins.map((admin) => (
              <tr key={admin._id}>
                <td className="font-semibold">{admin.adminname}</td>
                <td className="text-slate-500 dark:text-slate-400">{admin.email}</td>
                <td>{admin.adminphone}</td>
                <td>
                  <div className="flex gap-2 flex-wrap">
                    {activeTab === "pending" && (
                      <>
                        <button className="btn-action-primary" onClick={() => viewAdmin(admin._id)}>View</button>
                        <button className="btn-action-success" onClick={() => approveAdmin(admin._id)}>Approve</button>
                        <button className="btn-action-danger" onClick={() => openRejectModal(admin._id)}>Reject</button>
                      </>
                    )}
                    {(activeTab === "approved" || activeTab === "active") && (
                      <>
                        <button className="btn-action-warning" onClick={() => softDeleteAdmin(admin._id)}>Deactivate</button>
                        <button className="btn-action-danger" onClick={() => deleteAdmin(admin._id)}>Delete</button>
                      </>
                    )}
                    {activeTab === "rejected" && (
                      <>
                        <button className="btn-action-success" onClick={() => approveAdmin(admin._id)}>Approve</button>
                        <button className="btn-action-danger" onClick={() => deleteAdmin(admin._id)}>Delete</button>
                      </>
                    )}
                    {activeTab === "inactive" && (
                      <>
                        <button className="btn-action-success" onClick={() => restoreAdmin(admin._id)}>Make Active</button>
                        <button className="btn-action-danger" onClick={() => deleteAdmin(admin._id)}>Delete</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {displayedAdmins.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-8 text-slate-400 dark:text-slate-500">No Admin Records Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedAdmin && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setSelectedAdmin(null); }}>
          <div className="modal-box max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Admin Profile Details</h2>

            {selectedAdmin.ownerimage && (
              <img src={selectedAdmin.ownerimage} alt="Owner" className="w-24 h-24 rounded-xl object-cover mb-4 border border-slate-200 dark:border-slate-600" />
            )}

            <div className="flex flex-col gap-2 mb-4">
              {[
                ["Owner Name", selectedAdmin.adminname],
                ["Phone", selectedAdmin.adminphone],
                ["Email", selectedAdmin.email],
                ["Permanent Address", selectedAdmin.permanentaddress],
                ["Current Address", selectedAdmin.currentaddress],
                ["Request ID", selectedAdmin.AdminRequestId],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2 text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[120px]">{label}:</span>
                  <span className="text-slate-600 dark:text-slate-400">{value}</span>
                </div>
              ))}
              <div className="flex gap-2 text-sm items-center">
                <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[120px]">Status:</span>
                <span className={`status-badge ${selectedAdmin.status === "approved" ? "approved" : selectedAdmin.status === "rejected" ? "rejected" : "pending"}`}>
                  {selectedAdmin.status}
                </span>
              </div>
              {selectedAdmin.description && (
                <div className="flex gap-2 text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[120px]">Note:</span>
                  <span className="text-slate-600 dark:text-slate-400">{selectedAdmin.description}</span>
                </div>
              )}
            </div>

            <div className="flex gap-4 flex-wrap mt-3">
              {selectedAdmin.profileimage && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Profile Image</p>
                  <img src={selectedAdmin.profileimage} alt="Profile" className="w-28 h-28 rounded-lg object-cover border border-slate-200 dark:border-slate-600" />
                </div>
              )}
              {selectedAdmin.addhar && selectedAdmin.addhar.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Verification Document</p>
                  <img src={selectedAdmin.addhar[0]} alt="Proof" className="w-36 h-28 rounded-lg object-contain border border-slate-200 dark:border-slate-600" />
                </div>
              )}
            </div>

            <button className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" onClick={() => { setShowModal(false); setSelectedAdmin(null); }}>
              Close
            </button>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="modal-overlay" onClick={() => { setShowRejectModal(false); setRejectingId(null); setRejectReason(""); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Reject Administration Request</h2>
            <p className="text-sm text-red-500 mb-3">Please provide a reason for rejecting this administrative profile entry:</p>
            <textarea
              className="form-textarea w-full min-h-[100px] resize-none"
              placeholder="Enter rejection logs or parameter details here..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end mt-4">
              <button className="btn-action-danger" onClick={confirmReject}>Confirm Reject</button>
              <button className="btn-action-secondary" onClick={() => { setShowRejectModal(false); setRejectingId(null); setRejectReason(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagement;
