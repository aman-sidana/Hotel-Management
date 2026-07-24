const express = require("express");
const router = express.Router();
const roomController = require("../Controller/roomController");

router.post("/addroom", roomController.addRoom);

router.get("/getallrooms", roomController.getAllRooms);

router.patch("/updateroom", roomController.updateRoom);

router.patch("/softdelete", roomController.softDeleteRoom);

router.patch("/restore", roomController.restoreRoom);

router.delete("/delete", roomController.deleteRoom);

router.post("/admin-add-room", roomController.adminAddRoom);
router.get("/viewbyone",roomController.viewdetails)

module.exports = router;