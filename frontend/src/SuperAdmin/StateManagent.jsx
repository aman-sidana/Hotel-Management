import React, { useEffect, useState } from "react";
import axios from "axios";

function StateManagement() {
  const [states, setStates] = useState([]);
  const [stateName, setStateName] = useState("");

  const [editId, setEditId] = useState("");
  const [editState, setEditState] = useState("");

  const [activeTab, setActiveTab] = useState("active");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("stateAsc");

  useEffect(() => {
    getStates();
  }, []);

  const getStates = async () => {
    try {
      const result = await axios.get("http://localhost:1100/state/getstates");
      setStates(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const addState = async () => {
    if (!stateName) return;
    try {
      await axios.post("http://localhost:1100/state/addstate", { stateName });
      setStateName("");
      getStates();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteState = async (id) => {
    try {
      await axios.delete(`http://localhost:1100/state/deletestate?id=${id}`);
      getStates();
    } catch (error) {
      console.log(error);
    }
  };

  const updateState = async () => {
    try {
      await axios.patch(`http://localhost:1100/state/updatestate?id=${editId}`, {
        stateName: editState,
      });
      setEditId("");
      setEditState("");
      getStates();
    } catch (error) {
      console.log(error);
    }
  };

  const softDelete = async (id) => {
    try {
      await axios.patch(`http://localhost:1100/state/softdeletestate?id=${id}`);
      getStates();
    } catch (error) {
      console.log(error);
    }
  };

  const restoreState = async (id) => {
    try {
      await axios.patch(`http://localhost:1100/state/restorestate?id=${id}`);
      getStates();
    } catch (error) {
      console.log(error);
    }
  };

  const filteredStates = states.filter((state) => {
    if (activeTab === "active") {
      return state.status === true;
    } else if (activeTab === "inactive") {
      return state.status === false;
    }
    return true;
  });

  const searchedStates = filteredStates.filter((item) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = item.stateName ? item.stateName.toLowerCase().includes(q) : false;
    const countryMatch = item.countryName ? item.countryName.toLowerCase().includes(q) : false;
    return nameMatch || countryMatch;
  });

  const displayedStates = [...searchedStates].sort((a, b) => {
    if (sortBy === "stateAsc") {
      return (a.stateName || "").localeCompare(b.stateName || "");
    } else if (sortBy === "stateDesc") {
      return (b.stateName || "").localeCompare(a.stateName || "");
    } else if (sortBy === "countryAsc") {
      return (a.countryName || "").localeCompare(b.countryName || "");
    } else if (sortBy === "countryDesc") {
      return (b.countryName || "").localeCompare(a.countryName || "");
    }
    return 0;
  });

  return (
    <div className="management-module">
      <h2>State Management</h2>

      {/* Add Form */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          type="text"
          className="form-input flex-1 min-w-[200px]"
          placeholder="Enter State Name"
          value={stateName}
          onChange={(e) => setStateName(e.target.value)}
        />
        <button className="btn-action-primary" onClick={addState}>+ Add State</button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap mb-5">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "active" ? "bg-blue-600 text-white" : "btn-action-secondary"}`}
          onClick={() => setActiveTab("active")}
        >
          Active States
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "inactive" ? "bg-blue-600 text-white" : "btn-action-secondary"}`}
          onClick={() => setActiveTab("inactive")}
        >
          Inactive States
        </button>

        <select
          className="form-select ml-auto"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="stateAsc">State (A - Z)</option>
          <option value="stateDesc">State (Z - A)</option>
          <option value="countryAsc">Country (A - Z)</option>
          <option value="countryDesc">Country (Z - A)</option>
        </select>

        <input
          type="text"
          className="form-input w-44"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Country</th>
              <th>State</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedStates.map((item) => (
              <tr key={item._id}>
                <td>{item.countryName || "India"}</td>
                <td>
                  {editId === item._id ? (
                    <input
                      className="form-input w-36"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                    />
                  ) : (
                    item.stateName
                  )}
                </td>
                <td>
                  <span className={`status-badge ${item.status ? "approved" : "rejected"}`}>
                    {item.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2 flex-wrap">
                    {editId === item._id ? (
                      <>
                        <button className="btn-action-primary" onClick={updateState}>Save</button>
                        <button className="btn-action-secondary" onClick={() => setEditId("")}>Cancel</button>
                      </>
                    ) : (
                      <button
                        className="btn-action-secondary"
                        onClick={() => { setEditId(item._id); setEditState(item.stateName); }}
                      >
                        Edit
                      </button>
                    )}

                    <button className="btn-action-danger" onClick={() => deleteState(item._id)}>Delete</button>

                    {item.status ? (
                      <button className="btn-action-warning" onClick={() => softDelete(item._id)}>Deactivate</button>
                    ) : (
                      <button className="btn-action-success" onClick={() => restoreState(item._id)}>Restore</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {displayedStates.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-8 text-slate-400 dark:text-slate-500">
                  No {activeTab === "active" ? "Active" : "Inactive"} States Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StateManagement;