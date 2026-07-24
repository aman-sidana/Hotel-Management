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

    const [activeTab, setActiveTab] = useState("active");

    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("districtAsc");

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
        if (!districtName || !stateId) { return alert("Fill all fields"); }
        try {
            await axios.post("http://localhost:1100/district/adddistrict", { districtName, stateId });
            setDistrictName(""); setStateId(""); getDistricts();
        } catch (error) {
            console.log(error); alert("Failed to add district.");
        }
    };

    const updateDistrict = async () => {
        try {
            await axios.patch(`http://localhost:1100/district/updatedistrict?id=${editId}`, {
                districtName: editDistrict, stateId: editStateId,
            });
            setEditId(""); setEditDistrict(""); setEditStateId(""); getDistricts();
        } catch (error) {
            console.log(error); alert("Failed to update district.");
        }
    };

    const deleteDistrict = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this district?")) return;
        try {
            await axios.delete(`http://localhost:1100/district/deletedistrict?id=${id}`);
            getDistricts();
        } catch (error) {
            console.log(error); alert("Failed to delete district.");
        }
    };

    const softDeleteDistrict = async (id) => {
        try {
            await axios.patch(`http://localhost:1100/district/softdeletedistrict?id=${id}`);
            getDistricts();
        } catch (error) { console.log(error); }
    };

    const restoreDistrict = async (id) => {
        try {
            await axios.patch(`http://localhost:1100/district/restoredistrict?id=${id}`);
            getDistricts();
        } catch (error) { console.log(error); }
    };

    const filteredDistricts = districts.filter((district) => {
        if (activeTab === "active") return district.status === true;
        else if (activeTab === "inactive") return district.status === false;
        return true;
    });

    const searchedDistricts = filteredDistricts.filter((item) => {
        const q = searchQuery.toLowerCase();
        const districtMatch = item.districtName ? item.districtName.toLowerCase().includes(q) : false;
        const stateMatch = item.stateId?.stateName ? item.stateId.stateName.toLowerCase().includes(q) : false;
        return districtMatch || stateMatch;
    });

    const displayedDistricts = [...searchedDistricts].sort((a, b) => {
        if (sortBy === "districtAsc") return (a.districtName || "").localeCompare(b.districtName || "");
        else if (sortBy === "districtDesc") return (b.districtName || "").localeCompare(a.districtName || "");
        else if (sortBy === "stateAsc") return (a.stateId?.stateName || "").localeCompare(b.stateId?.stateName || "");
        else if (sortBy === "stateDesc") return (b.stateId?.stateName || "").localeCompare(a.stateId?.stateName || "");
        return 0;
    });

    return (
        <div className="management-module">
            <h2>District Management</h2>

            <div className="flex gap-3 mb-5 flex-wrap">
                <select className="form-select" value={stateId} onChange={(e) => setStateId(e.target.value)}>
                    <option value="">Select State</option>
                    {states.map((state) => (
                        <option key={state._id} value={state._id}>{state.stateName}</option>
                    ))}
                </select>
                <input
                    type="text" className="form-input flex-1 min-w-[160px]"
                    placeholder="District Name" value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                />
                <button className="btn-action-primary" onClick={addDistrict}>+ Add District</button>
            </div>

            <div className="flex gap-3 items-center flex-wrap mb-5">
                <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "active" ? "bg-blue-600 text-white" : "btn-action-secondary"}`} onClick={() => setActiveTab("active")}>Active Districts</button>
                <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "inactive" ? "bg-blue-600 text-white" : "btn-action-secondary"}`} onClick={() => setActiveTab("inactive")}>Inactive Districts</button>
                <select className="form-select ml-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="districtAsc">District (A - Z)</option>
                    <option value="districtDesc">District (Z - A)</option>
                    <option value="stateAsc">State (A - Z)</option>
                    <option value="stateDesc">State (Z - A)</option>
                </select>
                <input type="text" className="form-input w-44" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>District</th>
                            <th>State</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedDistricts.map((district) => (
                            <tr key={district._id}>
                                <td>
                                    {editId === district._id ? (
                                        <input className="form-input w-36" value={editDistrict} onChange={(e) => setEditDistrict(e.target.value)} />
                                    ) : district.districtName}
                                </td>
                                <td>
                                    {editId === district._id ? (
                                        <select className="form-select" value={editStateId} onChange={(e) => setEditStateId(e.target.value)}>
                                            <option value="">Select State</option>
                                            {states.map((state) => (
                                                <option key={state._id} value={state._id}>{state.stateName}</option>
                                            ))}
                                        </select>
                                    ) : district.stateId?.stateName}
                                </td>
                                <td>
                                    <span className={`status-badge ${district.status ? "approved" : "rejected"}`}>
                                        {district.status ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex gap-2 flex-wrap">
                                        {editId === district._id ? (
                                            <>
                                                <button className="btn-action-primary" onClick={updateDistrict}>Save</button>
                                                <button className="btn-action-secondary" onClick={() => setEditId("")}>Cancel</button>
                                            </>
                                        ) : (
                                            <button className="btn-action-secondary" onClick={() => { setEditId(district._id); setEditDistrict(district.districtName); setEditStateId(district.stateId?._id); }}>Edit</button>
                                        )}
                                        <button className="btn-action-danger" onClick={() => deleteDistrict(district._id)}>Delete</button>
                                        {district.status ? (
                                            <button className="btn-action-warning" onClick={() => softDeleteDistrict(district._id)}>Deactivate</button>
                                        ) : (
                                            <button className="btn-action-success" onClick={() => restoreDistrict(district._id)}>Restore</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {displayedDistricts.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-slate-400 dark:text-slate-500">
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