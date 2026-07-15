const express = require("express");
const Router = express.Router();

const cityController = require("../Controller/CityController");

Router.get("/getcities", cityController.getAllCity);

Router.post("/addcity", cityController.addCity);

Router.patch("/updatecity", cityController.updateCity);

Router.delete("/deletecity", cityController.deleteCity);

Router.patch("/softdeletecity", cityController.softDeleteCity);

Router.patch("/restorecity", cityController.restoreCity);

module.exports = Router;