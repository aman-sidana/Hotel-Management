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

  const [activeTab, setActiveTab] = useState("active");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("cityAsc");

  useEffect(() => {
    getStates();
    getDistricts();
    getCities();
  }, []);

  const getStates = async () => {
    try {
      const result = await axios.get("http://localhost:1100/state/getstates");
      setStates(result.data);
    } catch (error) { console.log(error); }
  };

  const getDistricts = async () => {
    try {
      const result = await axios.get("http://localhost:1100/district/getdistricts");
      setDistricts(result.data);
    } catch (error) { console.log(error); }
  };

  const getCities = async () => {
    try {
      const result = await axios.get("http://localhost:1100/city/getcities");
      setCities(result.data);
    } catch (error) { console.log(error); }
  };

  const addCity = async () => {
    if (!cityName || !districtId) { return alert("Fill all fields"); }
    try {
      await axios.post("http://localhost:1100/city/addcity", { cityName, districtId });
      setCityName(""); setDistrictId(""); setStateId(""); getCities();
    } catch (error) { console.log(error); }
  };

  const updateCity = async () => {
    try {
      await axios.patch(`http://localhost:1100/city/updatecity?id=${editId}`, {
        cityName: editCity, districtId: editDistrictId,
      });
      setEditId(""); setEditCity(""); setEditDistrictId(""); getCities();
    } catch (error) { console.log(error); }
  };

  const deleteCity = async (id) => {
    try {
      await axios.delete(`http://localhost:1100/city/deletecity?id=${id}`);
      getCities();
    } catch (error) { console.log(error); }
  };

  const softDeleteCity = async (id) => {
    try {
      await axios.patch(`http://localhost:1100/city/softdeletecity?id=${id}`);
      getCities();
    } catch (error) { console.log(error); }
  };

  const restoreCity = async (id) => {
    try {
      await axios.patch(`http://localhost:1100/city/restorecity?id=${id}`);
      getCities();
    } catch (error) { console.log(error); }
  };

  const filteredDistricts = districts.filter(
    (district) => district.stateId?._id === stateId
  );

  const filteredCities = cities.filter((city) => {
    if (activeTab === "active") return city.status === true;
    else if (activeTab === "inactive") return city.status === false;
    return true;
  });

  const searchedCities = filteredCities.filter((item) => {
    const q = searchQuery.toLowerCase();
    const cityMatch = item.cityName ? item.cityName.toLowerCase().includes(q) : false;
    const districtMatch = item.districtId?.districtName ? item.districtId.districtName.toLowerCase().includes(q) : false;
    return cityMatch || districtMatch;
  });

  const displayedCities = [...searchedCities].sort((a, b) => {
    if (sortBy === "cityAsc") return (a.cityName || "").localeCompare(b.cityName || "");
    else if (sortBy === "cityDesc") return (b.cityName || "").localeCompare(a.cityName || "");
    else if (sortBy === "districtAsc") return (a.districtId?.districtName || "").localeCompare(b.districtId?.districtName || "");
    else if (sortBy === "districtDesc") return (b.districtId?.districtName || "").localeCompare(a.districtId?.districtName || "");
    return 0;
  });

  return (
    <div className="management-module">
      <h2>City Management</h2>

      <div className="flex gap-3 mb-5 flex-wrap">
        <select className="form-select" value={stateId} onChange={(e) => { setStateId(e.target.value); setDistrictId(""); }}>
          <option value="">Select State</option>
          {states.map((state) => <option key={state._id} value={state._id}>{state.stateName}</option>)}
        </select>

        <select className="form-select" value={districtId} onChange={(e) => setDistrictId(e.target.value)}>
          <option value="">Select District</option>
          {filteredDistricts.map((district) => <option key={district._id} value={district._id}>{district.districtName}</option>)}
        </select>

        <input type="text" className="form-input flex-1 min-w-[140px]" placeholder="City Name" value={cityName} onChange={(e) => setCityName(e.target.value)} />
        <button className="btn-action-primary" onClick={addCity}>+ Add City</button>
      </div>

      <div className="flex gap-3 items-center flex-wrap mb-5">
        <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "active" ? "bg-blue-600 text-white" : "btn-action-secondary"}`} onClick={() => setActiveTab("active")}>Active Cities</button>
        <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "inactive" ? "bg-blue-600 text-white" : "btn-action-secondary"}`} onClick={() => setActiveTab("inactive")}>Inactive Cities</button>
        <select className="form-select ml-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="cityAsc">City (A - Z)</option>
          <option value="cityDesc">City (Z - A)</option>
          <option value="districtAsc">District (A - Z)</option>
          <option value="districtDesc">District (Z - A)</option>
        </select>
        <input type="text" className="form-input w-44" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>City</th>
              <th>District</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedCities.map((city) => (
              <tr key={city._id}>
                <td>
                  {editId === city._id ? (
                    <input className="form-input w-32" value={editCity} onChange={(e) => setEditCity(e.target.value)} />
                  ) : city.cityName}
                </td>
                <td>
                  {editId === city._id ? (
                    <select className="form-select" value={editDistrictId} onChange={(e) => setEditDistrictId(e.target.value)}>
                      {districts.map((district) => <option key={district._id} value={district._id}>{district.districtName}</option>)}
                    </select>
                  ) : city.districtId?.districtName}
                </td>
                <td>
                  <span className={`status-badge ${city.status ? "approved" : "rejected"}`}>
                    {city.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2 flex-wrap">
                    {editId === city._id ? (
                      <>
                        <button className="btn-action-primary" onClick={updateCity}>Save</button>
                        <button className="btn-action-secondary" onClick={() => setEditId("")}>Cancel</button>
                      </>
                    ) : (
                      <button className="btn-action-secondary" onClick={() => { setEditId(city._id); setEditCity(city.cityName); setEditDistrictId(city.districtId?._id); }}>Edit</button>
                    )}
                    <button className="btn-action-danger" onClick={() => deleteCity(city._id)}>Delete</button>
                    {city.status ? (
                      <button className="btn-action-warning" onClick={() => softDeleteCity(city._id)}>Deactivate</button>
                    ) : (
                      <button className="btn-action-success" onClick={() => restoreCity(city._id)}>Restore</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {displayedCities.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-8 text-slate-400 dark:text-slate-500">
                  No {activeTab === "active" ? "Active" : "Inactive"} Cities Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CityManagement;