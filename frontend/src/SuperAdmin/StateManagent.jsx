import React, { useEffect, useState } from "react";
import axios from "axios";

function StateManagement() {
  const [states, setStates] = useState([]);
  const [stateName, setStateName] = useState("");

  const [editId, setEditId] = useState("");
  const [editState, setEditState] = useState("");

  const [activeTab, setActiveTab] = useState("active");

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

  return (
    <div className="management-module">
      <h2>State Management</h2>

      <div className="form-controls">
        <input
          type="text"
          className="form-input"
          placeholder="Enter State"
          value={stateName}
          onChange={(e) => setStateName(e.target.value)}
        />
        <button className="btn btn-primary" onClick={addState}>Add State</button>
      </div>

      <div className="filter-buttons" style={{ margin: "20px 0" }}>
        <button
          className={`btn ${activeTab === "active" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("active")}
        >
          Active States
        </button>
        <button
          className={`btn ${activeTab === "inactive" ? "btn-primary" : "btn-secondary"}`}
          style={{ marginLeft: "10px" }}
          onClick={() => setActiveTab("inactive")}
        >
          Inactive States
        </button>
      </div>

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
            {filteredStates.map((item) => (
              <tr key={item._id}>
                <td>{item.countryName}</td>
                <td>
                  {editId === item._id ? (
                    <input
                      className="form-input"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                    />
                  ) : (
                    item.stateName
                  )}
                </td>
                <td>{item.status ? "Active" : "Inactive"}</td>
                <td>
                  <div className="action-buttons">
                    {editId === item._id ? (
                      <>
                        <button className="btn btn-primary" onClick={updateState}>Save</button>
                       
                        <button className="btn btn-secondary" style={{ marginLeft: "5px" }} onClick={() => setEditId("")}>Cancel</button>
                      </>
                    ) : (
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditId(item._id);
                          setEditState(item.stateName);
                        }}
                      >
                        Edit
                      </button>
                    )}

                    <button className="btn btn-danger" style={{ marginLeft: "5px" }} onClick={() => deleteState(item._id)}>
                      Delete
                    </button>

                    {item.status ? (
                      <button className="btn btn-warning" style={{ marginLeft: "5px" }} onClick={() => softDelete(item._id)}>
                        Soft Delete
                      </button>
                    ) : (
                      <button className="btn btn-secondary" style={{ marginLeft: "5px" }} onClick={() => restoreState(item._id)}>
                        Restore
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filteredStates.length === 0 && (
              <tr>
                <td colSpan="4" align="center" style={{ padding: "20px", color: "#666" }}>
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