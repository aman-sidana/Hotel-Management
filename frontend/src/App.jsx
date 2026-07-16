import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./genericComponents/Login";
import Signup from "./genericComponents/Signup";
import Header from "./genericComponents/Header";
import ResetPassword from "./genericComponents/ResetPassword";
import ForgetPassword from "./genericComponents/ForgetPassword";
import ProtectedRoute from "./genericComponents/ProtectedRoute";

import Home from "./SuperAdmin/Home";

import Sidebar from "./SuperAdmin/Sidebar";
import StateManagement from "./SuperAdmin/StateManagent";

import "./App.css"
import HotelForm from "./genericComponents/HotelForm";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forget" element={<ForgetPassword />} />
        <Route path="/hotelform" element={<HotelForm />} />



        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/reset" element={
          <ProtectedRoute>
            <ResetPassword />
          </ProtectedRoute>
        } />

        <Route path="/state" element={
          <ProtectedRoute>
            <StateManagement />
          </ProtectedRoute>
        } />


      </Routes>
    </BrowserRouter>
  );
}

export default App;