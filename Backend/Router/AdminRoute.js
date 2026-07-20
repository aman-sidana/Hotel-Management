const express = require('express');
const AdminController = require('../Controller/AdminController');
const router = express.Router();

router.post("/send-otp", AdminController.sendAdminOTP);
router.post("/verify-otp", AdminController.verifyOTP);
router.post("/submit-request", AdminController.AdminRequest); 
router.post("/check-request-id", AdminController.checkRequestId); 


router.post("/super-admin-add", AdminController.superAdminAdd);
router.get("/alladmin", AdminController.allADmin);
router.get("/details", AdminController.viewAdminDetails); 

router.patch("/approve", AdminController.approveAdminRequest); 
router.patch("/reject", AdminController.rejectRequest); 

router.patch("/update", AdminController.updateRequest); 
router.patch("/soft-delete", AdminController.softDeleteHotel); 
router.patch("/restore", AdminController.restoreAdmin); 
router.delete("/delete", AdminController.deleteAdmin); 

module.exports = router;