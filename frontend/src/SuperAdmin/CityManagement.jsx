import React, { useEffect, useState } from "react";
import axios from "axios";

function CityManagement() {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [cityName, setCityName] = useState("");

  const [editId, setEditId] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editDistrictId, setEditDistrictId] = useState("");

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

  const addCity = async () => {
    if (!cityName || !districtId) {
      return alert("Fill all fields");
    }
    try {
      await axios.post("http://localhost:1100/city/addcity", {
        cityName,
        districtId,
      });
      setCityName("");
      setDistrictId("");
      setStateId("");
      getCities();
    } catch (error) {
      console.log(error);
    }
  };

  const updateCity = async () => {
    try {
      await axios.patch(`http://localhost:1100/city/updatecity?id=${editId}`, {
        cityName: editCity,
        districtId: editDistrictId,
      });
      setEditId("");
      setEditCity("");
      setEditDistrictId("");
      getCities();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteCity = async (id) => {
    try {
      await axios.delete(`http://localhost:1100/city/deletecity?id=${id}`);
      getCities();
    } catch (error) {
      console.log(error);
    }
  };

  const softDeleteCity = async (id) => {
    try {
      await axios.patch(`http://localhost:1100/city/softdeletecity?id=${id}`);
      getCities();
    } catch (error) {
      console.log(error);
    }
  };

  const restoreCity = async (id) => {
    try {
      await axios.patch(`http://localhost:1100/city/restorecity?id=${id}`);
      getCities();
    } catch (error) {
      console.log(error);
    }
  };

  const filteredDistricts = districts.filter(
    (district) => district.stateId?._id === stateId
  );

  return (
    <div className="management-module">
      <h2>City Management</h2>

      <div className="form-controls">
        <select
          className="form-select"
          value={stateId}
          onChange={(e) => {
            setStateId(e.target.value);
            setDistrictId("");
          }}
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state._id} value={state._id}>
              {state.stateName}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
        >
          <option value="">Select District</option>
          {filteredDistricts.map((district) => (
            <option key={district._id} value={district._id}>
              {district.districtName}
            </option>
          ))}
        </select>

        <input
          type="text"
          className="form-input"
          placeholder="City Name"
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
        />

        <button className="btn btn-primary" onClick={addCity}>Add City</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>City</th>
              <th>District</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city) => (
              <tr key={city._id}>
                <td>
                  {editId === city._id ? (
                    <input
                      className="form-input"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                    />
                  ) : (
                    city.cityName
                  )}
                </td>
                <td>
                  {editId === city._id ? (
                    <select
                      className="form-select"
                      value={editDistrictId}
                      onChange={(e) => setEditDistrictId(e.target.value)}
                    >
                      {districts.map((district) => (
                        <option key={district._id} value={district._id}>
                          {district.districtName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    city.districtId?.districtName
                  )}
                </td>
                <td>{city.status ? "Active" : "Inactive"}</td>
                <td>
                  <div className="action-buttons">
                    {editId === city._id ? (
                      <button className="btn btn-primary" onClick={updateCity}>Save</button>
                    ) : (
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditId(city._id);
                          setEditCity(city.cityName);
                          setEditDistrictId(city.districtId?._id);
                        }}
                      >
                        Edit
                      </button>
                    )}
                    <button className="btn btn-danger" onClick={() => deleteCity(city._id)}>
                      Delete
                    </button>
                    {city.status ? (
                      <button className="btn btn-warning" onClick={() => softDeleteCity(city._id)}>
                        Soft Delete
                      </button>
                    ) : (
                      <button className="btn btn-secondary" onClick={() => restoreCity(city._id)}>
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

export default CityManagement;