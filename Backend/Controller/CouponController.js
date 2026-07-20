const CouponModel = require("../Model/CouponModel")
const HotelModel = require("../Model/HotelModel")
const { uploadImage } = require("../Utils/Cloudinary")

exports.softDeleteCoupon = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Coupon ID is required"
            });
        }

        const coupon = await CouponModel.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon deactivated successfully",
            result: coupon
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.restoreCoupon = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Coupon ID is required"
            });
        }

        const coupon = await CouponModel.findByIdAndUpdate(
            id,
            { isActive: true },
            { new: true }
        );

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon restored successfully",
            result: coupon
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.couponDelete = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Coupon ID is required"
            });
        }

        const result = await CouponModel.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon deleted successfully",
            result
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.getCoupon = async (req, res) => {
    try {
        const result = await CouponModel.find().populate("hotelId", "hotelname hotelemail hotelphone");
        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No coupons found"
            });
        }

        return res.status(200).json({
            success: true,
            result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Coupon ID is required"
            });
        }

        let updateData = { ...req.body };

        if (req.files && req.files.images) {
            const filesToUpload = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            const uploadResults = await uploadImage(filesToUpload);
            if (uploadResults.length > 0) {
                updateData.couponImages = uploadResults[0].secure_url;
            }
        }

        const updatedCoupon = await CouponModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedCoupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon updated successfully",
            result: updatedCoupon
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.couponAdd = async (req, res) => {
    try {
        const {
            hotelId,
            couponCode,
            couponType,
            discount,
            minPriceAvail,
            startingDate,
            dateUpTo
        } = req.body;

        if (
            !hotelId ||
            !couponCode ||
            !couponType ||
            !discount ||
            !startingDate ||
            !dateUpTo
        ) {
            return res.status(400).json({
                message: "All mandatory fields are required"
            });
        }

        const hotelExists = await HotelModel.findById(hotelId);
        if (!hotelExists) {
            return res.status(404).json({
                message: "Hotel not found"
            });
        }

        const existingCoupon = await CouponModel.findOne({ couponCode });
        if (existingCoupon) {
            return res.status(400).json({
                message: "Coupon code already exists"
            });
        }

        let singleImageUrl = "";
        if (req.files && req.files.images) {
            const filesToUpload = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            const uploadResults = await uploadImage(filesToUpload);
            if (uploadResults.length > 0) {
                singleImageUrl = uploadResults[0].secure_url;
            }
        }

        const result = await CouponModel.create({
            hotelId,
            couponCode,
            couponType,
            discount,
            minPriceAvail: minPriceAvail || 0,
            startingDate,
            dateUpTo,
            couponImages: singleImageUrl,
            isActive: true
        });

        return res.status(201).json({
            message: "Coupon added successfully",
            result
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}
