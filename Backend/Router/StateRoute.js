const express = require("express");
const Router = express.Router();
const stateController = require("../Controller/StateController");

Router.get("/getstates", stateController.getAllState);
Router.post("/addstate", stateController.addState);
Router.delete("/deletestate", stateController.deleteState);
Router.patch("/updatestate", stateController.updatestate);
Router.patch("/softdeletestate", stateController.softDeleteState);
Router.patch("/restorestate", stateController.restoreState);

module.exports = Router;