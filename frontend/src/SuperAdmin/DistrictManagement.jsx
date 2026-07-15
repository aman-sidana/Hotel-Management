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
        }
    };

    const deleteDistrict = async (id) => {
        try {
            await axios.delete(`http://localhost:1100/district/deletedistrict?id=${id}`);
            getDistricts();
        } catch (error) {
            console.log(error);
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
                        {districts.map((district) => (
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
                                            <button className="btn btn-primary" onClick={updateDistrict}>Save</button>
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
                                        <button className="btn btn-danger" onClick={() => deleteDistrict(district._id)}>
                                            Delete
                                        </button>
                                        {district.status ? (
                                            <button className="btn btn-warning" onClick={() => softDeleteDistrict(district._id)}>
                                                Soft Delete
                                            </button>
                                        ) : (
                                            <button className="btn btn-secondary" onClick={() => restoreDistrict(district._id)}>
                                                Restore
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DistrictManagement;