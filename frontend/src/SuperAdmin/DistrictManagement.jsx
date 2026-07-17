import React, { useEffect, useState } from "react";
import axios from "axios";

function DistrictManagement() {
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);

    const [districtName, setDistrictName] = useState("");
    const [stateId, setStateId] = useState("");

    const [editId, setEditId] = useState("");
    const [editDistrict, setEditDistrict] = useState("");
    const [editStateId, setEditStateId] = useState("");

    // ✅ CHANGE: Added state to track which tab is active (default is "active")
    const [activeTab, setActiveTab] = useState("active");

    useEffect(() => {
        getStates();
        getDistricts();
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

    const addDistrict = async () => {
        if (!districtName || !stateId) {
            return alert("Fill all fields");
        }
        try {
            await axios.post("http://localhost:1100/district/adddistrict", {
                districtName,
                stateId,
            });
            setDistrictName("");
            setStateId("");
            getDistricts();
        } catch (error) {
            console.log(error);
            alert("Failed to add district.");
        }
    };

    const updateDistrict = async () => {
        try {
            await axios.patch(`http://localhost:1100/district/updatedistrict?id=${editId}`, {
                districtName: editDistrict,
                stateId: editStateId,
            });
            setEditId("");
            setEditDistrict("");
            setEditStateId("");
            getDistricts();
        } catch (error) {
            console.log(error);
            alert("Failed to update district.");
        }
    };

    const deleteDistrict = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this district?")) return;
        
        try {
            await axios.delete(`http://localhost:1100/district/deletedistrict?id=${id}`);
            getDistricts();
        } catch (error) {
            console.log(error);
            alert("Failed to delete district.");
        }
    };

    const softDeleteDistrict = async (id) => {
        try {
            await axios.patch(`http://localhost:1100/district/softdeletedistrict?id=${id}`);
            getDistricts();
        } catch (error) {
            console.log(error);
        }
    };

    const restoreDistrict = async (id) => {
        try {
            await axios.patch(`http://localhost:1100/district/restoredistrict?id=${id}`);
            getDistricts();
        } catch (error) {
            console.log(error);
        }
    };

    // ✅ CHANGE: Filter the districts based on the currently selected tab
    const filteredDistricts = districts.filter((district) => {
        if (activeTab === "active") {
            return district.status === true;
        } else if (activeTab === "inactive") {
            return district.status === false;
        }
        return true;
    });

    return (
        <div className="management-module">
            <h2>District Management</h2>

            <div className="form-controls">
                <select
                    className="form-select"
                    value={stateId}
                    onChange={(e) => setStateId(e.target.value)}
                >
                    <option value="">Select State</option>
                    {states.map((state) => (
                        <option key={state._id} value={state._id}>
                            {state.stateName}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    className="form-input"
                    placeholder="District Name"
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                />

                <button className="btn btn-primary" onClick={addDistrict}>Add District</button>
            </div>

            {/* ✅ CHANGE: Added filter buttons right above the table */}
            <div className="filter-buttons" style={{ margin: "20px 0" }}>
                <button
                    className={`btn ${activeTab === "active" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setActiveTab("active")}
                >
                    Active Districts
                </button>
                <button
                    className={`btn ${activeTab === "inactive" ? "btn-primary" : "btn-secondary"}`}
                    style={{ marginLeft: "10px" }}
                    onClick={() => setActiveTab("inactive")}
                >
                    Inactive Districts
                </button>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>District</th>
                            <th>State</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* ✅ CHANGE: Map over filteredDistricts instead of all districts */}
                        {filteredDistricts.map((district) => (
                            <tr key={district._id}>
                                <td>
                                    {editId === district._id ? (
                                        <input
                                            className="form-input"
                                            value={editDistrict}
                                            onChange={(e) => setEditDistrict(e.target.value)}
                                        />
                                    ) : (
                                        district.districtName
                                    )}
                                </td>
                                <td>
                                    {editId === district._id ? (
                                        <select
                                            className="form-select"
                                            value={editStateId}
                                            onChange={(e) => setEditStateId(e.target.value)}
                                        >
                                            <option value="">Select State</option>
                                            {states.map((state) => (
                                                <option key={state._id} value={state._id}>
                                                    {state.stateName}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        district.stateId?.stateName
                                    )}
                                </td>
                                <td>{district.status ? "Active" : "Inactive"}</td>
                                <td>
                                    <div className="action-buttons">
                                        {editId === district._id ? (
                                            <>
                                                <button className="btn btn-primary" onClick={updateDistrict}>Save</button>
                                                <button className="btn btn-secondary" style={{ marginLeft: "5px" }} onClick={() => setEditId("")}>Cancel</button>
                                            </>
                                        ) : (
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => {
                                                    setEditId(district._id);
                                                    setEditDistrict(district.districtName);
                                                    setEditStateId(district.stateId?._id);
                                                }}
                                            >
                                                Edit
                                            </button>
                                        )}
                                        
                                        <button className="btn btn-danger" style={{ marginLeft: "5px" }} onClick={() => deleteDistrict(district._id)}>
                                            Delete
                                        </button>
                                        
                                        {district.status ? (
                                            <button className="btn btn-warning" style={{ marginLeft: "5px" }} onClick={() => softDeleteDistrict(district._id)}>
                                                Soft Delete
                                            </button>
                                        ) : (
                                            <button className="btn btn-secondary" style={{ marginLeft: "5px" }} onClick={() => restoreDistrict(district._id)}>
                                                Restore
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        
                        {/* ✅ CHANGE: Updated to check filteredDistricts array length */}
                        {filteredDistricts.length === 0 && (
                            <tr>
                                <td colSpan="4" align="center" style={{ padding: "20px", color: "#666" }}>
                                    No {activeTab === "active" ? "Active" : "Inactive"} Districts Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DistrictManagement;