import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function HotelForm() {
  const navigate = useNavigate()
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  const [form, setForm] = useState({
    hotelname: "",
    ownername: "",
    ownerphone: "",
    email: "",
    stateId: "",
    districtId: "",
    cityId: "",
    hoteladdress: "",
    totalrooms: "",
  });

  useEffect(() => {
    getStates();
    getDistricts();
    getCities();
  }, []);

  const getStates = async () => {
    try {
      const result = await axios.get(
        "http://localhost:1100/state/getstates"
      );
      setStates(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getDistricts = async () => {
    try {
      const result = await axios.get(
        "http://localhost:1100/district/getdistricts"
      );
      setDistricts(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getCities = async () => {
    try {
      const result = await axios.get(
        "http://localhost:1100/city/getcities"
      );
      setCities(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitHotel = async () => {
    try {
      await axios.post(
        "http://localhost:1100/hotel/hotelrequest",
        form
      );

      alert("Hotel Request Submitted");

      setForm({
        hotelname: "",
        ownername: "",
        ownerphone: "",
        email: "",
        stateId: "",
        districtId: "",
        cityId: "",
        hoteladdress: "",
        totalrooms: "",
      });
      navigate('/')
    } catch (error) {
      console.log(error);
    }
  };

  const filteredDistricts = districts.filter(
    (district) => district.stateId?._id === form.stateId
  );

  const filteredCities = cities.filter(
    (city) => city.districtId?._id === form.districtId
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>Hotel Registration</h2>

      <input
        type="text"
        name="hotelname"
        placeholder="Hotel Name"
        value={form.hotelname}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="ownername"
        placeholder="Owner Name"
        value={form.ownername}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="number"
        name="ownerphone"
        placeholder="Owner Phone"
        value={form.ownerphone}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />

      <br /><br />

      <select
        name="stateId"
        value={form.stateId}
        onChange={handleChange}
      >
        <option value="">Select State</option>

        {states.map((state) => (
          <option key={state._id} value={state._id}>
            {state.stateName}
          </option>
        ))}
      </select>

      <br /><br />

      <select
        name="districtId"
        value={form.districtId}
        onChange={handleChange}
      >
        <option value="">Select District</option>

        {filteredDistricts.map((district) => (
          <option key={district._id} value={district._id}>
            {district.districtName}
          </option>
        ))}
      </select>

      <br /><br />

      <select
        name="cityId"
        value={form.cityId}
        onChange={handleChange}
      >
        <option value="">Select City</option>

        {filteredCities.map((city) => (
          <option key={city._id} value={city._id}>
            {city.cityName}
          </option>
        ))}
      </select>

      <br /><br />

      <textarea
        name="hoteladdress"
        placeholder="Hotel Address"
        value={form.hoteladdress}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="number"
        name="totalrooms"
        placeholder="Total Rooms"
        value={form.totalrooms}
        onChange={handleChange}
      />

      <br /><br />

      <button onClick={submitHotel}>
        Submit Request
      </button>
    </div>
  );
}

export default HotelForm;