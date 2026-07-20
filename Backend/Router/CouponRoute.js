const express = require("express");
const couponController = require("../Controller/CouponController");
const router = express.Router();

router.get("/getallcoupon", couponController.getCoupon);

router.post("/addcoupon", couponController.couponAdd);
router.delete("/deletecoupon", couponController.couponDelete);

router.put("/updatecoupon", couponController.updateCoupon);
router.patch("/soft-delete", couponController.softDeleteCoupon);
router.patch("/restore", couponController.restoreCoupon);



module.exports = router;