const Hotelmodel = require("../Model/HotelModel");
const { info, otp } = require("../Utils/transporter");
const UserModel = require('../Model/UserModel');
const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcrypt');
const { uploadImage } = require("../Utils/Cloudinary");

exports.superAdminAddHotel = async (req, res) => {
    try {
        const {
            hotelname,
            hotelphone,
            hotelemail,
            stateId,
            districtId,
            cityId,
            hoteladdress,
            totalrooms,
            totalstaff,
            adminId 
        } = req.body;

        if (
            !hotelname ||
            !hotelphone ||
            !hotelemail ||
            !hoteladdress ||
            !totalrooms ||
            !totalstaff
        ) {
            return res.status(400).json({
                success: false,
                message: "All required hotel fields are missing details.",
            });
        }

        const hotelExists = await Hotelmodel.findOne({ hotelemail });
        if (hotelExists) {
            return res.status(400).json({
                success: false,
                message: "A hotel with this email already exists.",
            });
        }

        const userExists = await UserModel.findOne({ email: hotelemail });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User account credentials using this email already exist.",
            });
        }

        const randomPassword = uuidv4().substring(0, 10);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        const hotelRequestId = uuidv4().substring(0, 10);

        const hotel = await Hotelmodel.create({
            hotelname,
            hotelphone,
            hotelemail,
            stateId: stateId || null,
            districtId: districtId || null,
            cityId: cityId || null,
            hoteladdress,
            totalrooms,
            totalstaff,
            hotelRequestId,
            adminId: adminId || null,
            status: "approved",
            emailVerified: true,
            isActive: true
        });

        
        await UserModel.create({
            name: hotelname,
            phone: hotelphone,
            email: hotelemail,
            password: hashedPassword,
            role: "hotel" 
        });

        await info(
            hotelemail,
            "Hotel Account Activated Successfully",
            `
            <div style="font-family: Arial, sans-serif;">
                <h2>Welcome ${hotelname}! 🎉</h2>
                <p>Your hotel profile account has been directly registered and approved by the Super Admin.</p>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <h3>Dashboard Access Credentials</h3>
                <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; border-color: #eee;">
                    <tr>
                        <td><b>Login Email</b></td>
                        <td>${hotelemail}</td>
                    </tr>
                    <tr>
                        <td><b>Temporary Password</b></td>
                        <td><code>${randomPassword}</code></td>
                    </tr>
                    <tr>
                        <td><b>Hotel Request ID</b></td>
                        <td>${hotelRequestId}</td>
                    </tr>
                </table>
                <br>
                <p>Please log in using these credentials and promptly change your password configuration on your first login profile view.</p>
                <br>
                <p>Regards,</p>
                <h4>Management Team</h4>
            </div>
            `
        );

        return res.status(201).json({
            success: true,
            message: "Hotel profile configuration created successfully.",
            hotel,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
 
exports.allhotel = async (req, res) => {
    try {
        const result = await Hotelmodel.find()
            .populate("stateId", "stateName")
            .populate("districtId", "districtName")
            .populate("cityId", "cityName");

        if (result.length === 0) {
            return res.status(404).json({
                message: "hotel not found"
            });
        }
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "internal server Error"
        });
    }
};

exports.approveRequest = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                message: "Hotel Id not Found"
            });
        }

        const result = await Hotelmodel.findByIdAndUpdate(
            id, { status: "approved" }, { new: true }
        );

        if (!result) {
            return res.status(404).json({
                message: "Hotel not Found"
            });
        }

        const existsUser = await UserModel.findOne({
            email: result.hotelemail
        });

        if (existsUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const randomPassword = uuidv4().substring(0, 10);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        const useradd = await UserModel.create({
            name: result.hotelname,
            email: result.hotelemail,
            password: hashedPassword,
            phone: result.hotelphone,
            role: "hotel"
        });

        await info(
            result.hotelemail,
            "Hotel Registration Approved",
            `
            <div style="font-family: Arial, sans-serif;">
                <h2>Congratulations! 🎉</h2>
                <p>Dear Partners,</p>
                <p>Your hotel registration request has been <span style="color:green;"><strong>APPROVED</strong></span>.</p>
                <hr>
                <h3>Login Credentials</h3>
                <p><strong>Hotel Name:</strong> ${result.hotelname}</p>
                <p><strong>Email:</strong> ${result.hotelemail}</p>
                <p><strong>Password:</strong> ${randomPassword}</p>
                <br>
                <p>Please login using the above credentials and change your password after your first login.</p>
                <br>
                <p>Regards,</p>
                <h4>Hotel Management Team</h4>
            </div>
            `
        );

        return res.status(200).json({
            message: "Hotel Approved Successfully",
            hotel: result,
            user: useradd
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

exports.rejectRequest = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({
                message: "Hotel ID is required",
            });
        }
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({
                message: "description is required"
            });
        }

        const result = await Hotelmodel.findByIdAndUpdate(
            id,
            {
                status: "rejected",
                description: description || "No reason provided."
            },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                message: "Hotel not found",
            });
        }

        await info(
            result.hotelemail,
            "Hotel Registration Rejected",
            `
            <div style="font-family: Arial, sans-serif;">
                <h2>Hotel Registration Update</h2>
                <p>Dear Partners,</p>
                <p>We regret to inform you that your hotel registration request for <strong>${result.hotelname || "your hotel"}</strong> has been <span style="color:red;"><b>REJECTED</b></span>.</p>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <h3>Reason for Rejection:</h3>
                <blockquote style="background: #fdf2f2; border-left: 5px solid #e74c3c; padding: 15px; margin: 0; border-radius: 4px;">
                    ${result.description}
                </blockquote>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p>If you wish to update your details and resubmit, you can use your Request ID on our website: <strong>${result.hotelRequestId || "N/A"}</strong></p>
                <br>
                <p>Regards,</p>
                <h4>Hotel Management Team</h4>
            </div>
            `
        );

        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

exports.deleteHotel = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({
                message: "Hotel ID not Found"
            });
        }

        const result = await Hotelmodel.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({
                message: "Hotel not found",
            });
        }
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

exports.softDeleteHotel = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({
                message: "Hotel ID is required",
            });
        }

        const hotel = await Hotelmodel.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );
        if (!hotel) {
            return res.status(404).json({
                message: "Hotel not found",
            });
        }

        return res.status(200).json(hotel);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

exports.restoreHotel = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({
                message: "Hotel ID is required",
            });
        }

        const hotel = await Hotelmodel.findByIdAndUpdate(
            id,
            { isActive: true },
            { new: true }
        );

        if (!hotel) {
            return res.status(404).json({
                message: "Hotel not found",
            });
        }

        return res.status(200).json(hotel);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

exports.viewHotelDetails = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({
                message: "Hotel ID is required",
            });
        }

        const hotel = await Hotelmodel.findById(id)
            .populate("stateId", "stateName")
            .populate("districtId", "districtName")
            .populate("cityId", "cityName");

        if (!hotel) {
            return res.status(404).json({
                message: "Hotel not found",
            });
        }

        return res.status(200).json({
            message: "Hotel details fetched successfully",
            hotel,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

exports.sendhotelOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const existing = await Hotelmodel.findOne({ hotelemail: email });
        if (existing && existing.emailVerified) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const generatedOTP = otp();
        let hotel = await Hotelmodel.findOne({ hotelemail: email });

        if (!hotel) {
            hotel = new Hotelmodel({
                hotelemail: email
            });
        }

        hotel.otp = generatedOTP;
        hotel.expireTime = Date.now() + 5 * 60 * 1000;

        await hotel.save({ validateBeforeSave: false });

        await info(
            email,
            "OTP Verification",
            `<h2>Your OTP is ${generatedOTP}</h2>
             <p>OTP expires in 5 minutes.</p>`
        );

        return res.json({
            message: "OTP sent successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const hotel = await Hotelmodel.findOne({ hotelemail: email });
        if (!hotel) {
            return res.status(404).json({
                message: "Email not found"
            });
        }

        if (hotel.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        if (hotel.expireTime < Date.now()) {
            return res.status(400).json({
                message: "OTP Expired"
            });
        }

        hotel.emailVerified = true;
        hotel.otp = null;
        hotel.expireTime = null;

        await hotel.save({ validateBeforeSave: false });

        return res.json({
            message: "Email Verified"
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

exports.hotelRequest = async (req, res) => {
    try {
        const {
            hotelname,
            hotelphone,
            email,
            stateId,
            districtId,
            cityId,
            hoteladdress,
            totalrooms,
            totalstaff
        } = req.body;

        if (
            !hotelname ||
            !hotelphone ||
            !email ||
            !stateId ||
            !districtId ||
            !cityId ||
            !hoteladdress ||
            !totalrooms ||
            !totalstaff
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingRecord = await Hotelmodel.findOne({ hotelemail: email });
        if (!existingRecord || !existingRecord.emailVerified) {
            return res.status(400).json({
                message: "Please verify your email before submitting."
            });
        }

        let imageUrls = [];
        if (req.files && req.files.images) {
            const filesToUpload = Array.isArray(req.files.images)
                ? req.files.images
                : [req.files.images];

            const uploadResults = await uploadImage(filesToUpload);
            imageUrls = uploadResults.map(result => result.secure_url);
        }

        const hotelRequestId = uuidv4().substring(0, 10);

        const result = await Hotelmodel.findOneAndUpdate(
            { hotelemail: email },
            {
                hotelname,
                hotelphone,
                stateId,
                districtId,
                cityId,
                hoteladdress,
                totalrooms,
                totalstaff,
                hotelRequestId,
                images: imageUrls,
                status: "pending",
                isActive: true
            },
            { new: true }
        );

        if (!result) {
            return res.status(400).json({
                message: "Hotel requesting error"
            });
        }

        await info(
            result.hotelemail,
            "Hotel Request Submitted Successfully",
            `
            <div style="font-family: Arial, sans-serif;">
                <h2>Hotel Registration Request Submitted</h2>
                <p>Dear Partners,</p>
                <p>Thank you for submitting your hotel registration request.</p>
                <h3>Your Request ID</h3>
                <div style="background:#f5f5f5; padding:15px; font-size:24px; font-weight:bold; color:#0d6efd; border-radius:8px; width:fit-content;">
                    ${result.hotelRequestId}
                </div>
                <br>
                <p>You can use this Request ID to check your hotel registration status anytime.</p>
                <hr>
                <p><strong>Hotel Name:</strong> ${result.hotelname}</p>
                <p><strong>Email:</strong> ${result.hotelemail}</p>
                <br>
                <p>Regards,</p>
                <h4>Hotel Management Team</h4>
            </div>
            `
        );

        return res.status(201).json({
            message: "Hotel request submitted successfully",
            result
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

exports.checkRequestId = async (req, res) => {
    try {
        const { requestId } = req.body;
        if (!requestId) {
            return res.status(400).json({
                message: "Request ID is required"
            });
        }

        const existsRequest = await Hotelmodel.findOne({ hotelRequestId: requestId });
        if (!existsRequest) {
            return res.status(404).json({
                message: "NO Request Found"
            });
        }

        return res.status(200).json(existsRequest);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

exports.updateRequest = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: "Hotel ID is required" });
        }

        const updatedHotel = await Hotelmodel.findByIdAndUpdate(
            id,
            req.body,
            { returnDocument: "after" }
        );

        if (!updatedHotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        return res.status(200).json(updatedHotel);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};