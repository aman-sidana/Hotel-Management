const express = require('express')
const hotelController = require('../Controller/HotelController')
const router = express.Router()

router.get("/allhotels", hotelController.allhotel)

router.get("/viewhotel", hotelController.viewHotelDetails);

router.post("/hotelrequest", hotelController.hotelRequest)

router.patch("/approvehotel", hotelController.approveRequest)

router.patch("/rejecthotel", hotelController.rejectRequest)

router.patch("/softdeletehotel", hotelController.softDeleteHotel)

router.patch("/restorehotel", hotelController.restoreHotel)

router.delete("/deletehotel", hotelController.deleteHotel)

router.post('/checkrequestid',hotelController.checkRequestId)

router.patch("/updaterequest", hotelController.updateRequest);

router.post("/sendhotelotp", hotelController.sendhotelOTP);
router.post("/verifyotp", hotelController.verifyOTP);

module.exports = router
