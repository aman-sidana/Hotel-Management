const express = require("express");
const Router = express.Router();

const districtController = require("../Controller/DistrictController");


Router.get("/getdistricts", districtController.getAllDistrict);

Router.post("/adddistrict", districtController.addDistrict);

Router.patch("/updatedistrict", districtController.updateDistrict);

Router.delete("/deletedistrict", districtController.deleteDistrict);

Router.patch("/softdeletedistrict", districtController.softDeleteDistrict);

Router.patch("/restoredistrict", districtController.restoreDistrict);

module.exports = Router;