const Hotelmodel = require("../Model/HotelModel")
const { info, otp } = require("../Utils/transporter")
const UserModel = require('../Model/UserModel')
const { v4: uuidv4 } = require("uuid");
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { uploadImage } = require("../Utils/Cloudinary");

exports.allhotel = async (req, res) => {
    try {
        const result = await Hotelmodel.find()
            .populate("stateId", "stateName")
            .populate("districtId", "districtName")
            .populate("cityId", "cityName")

        if (result.length === 0) {
            return res.status(404).json({
                message: "hotel not found"
            })
        }
        return res.status(200).json(result)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "internal server Error"
        })
    }
}
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
            email: result.email
        });

        if (existsUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const randomPassword = uuidv4().substring(0, 10);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        const useradd = await UserModel.create({
            name: result.ownername,
            email: result.email,
            password: hashedPassword,
            phone: result.ownerphone,
            role: "hotelAdmin"
        });

        await info(
            result.email,
            "Hotel Registration Approved",
            `
            <div style="font-family: Arial, sans-serif;">

                <h2>Congratulations! 🎉</h2>

                <p>Dear <strong>${result.ownername}</strong>,</p>

                <p>
                    Your hotel registration request has been
                    <span style="color:green;">
                        <strong>APPROVED</strong>
                    </span>.
                </p>

                <hr>

                <h3>Login Credentials</h3>

                <p><strong>Hotel Name:</strong> ${result.hotelname}</p>

                <p><strong>Owner:</strong> ${result.ownername}</p>

                <p><strong>Email:</strong> ${result.email}</p>

                <p><strong>Password:</strong> ${randomPassword}</p>

                <br>

                <p>
                    Please login using the above credentials and
                    change your password after your first login.
                </p>

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
        // console.log(`>>>top`,req.body)
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
        // console.log(`>>>description`,description)

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

        console.log(`hotelemail`, result.email)
        console.log(`ownername`, result.ownername)
        console.log(`ownername`, result.description)
        console.log(`ownername`, result.hotelRequestId)



        await info(
            result.email,
            "Hotel Registration Rejected",
            `
            <div style="font-family: Arial, sans-serif;">
                <h2>Hotel Registration Update</h2>

                <p>Dear <strong>${result.ownername || "Owner"}</strong>,</p>

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
        const { id } = req.query
        if (!id) {
            return res.status(400).json({
                message: "Hotel ID not Found"
            })
        }

        const result = await Hotelmodel.findByIdAndDelete(id)
        if (!result) {
            return res.status(404).json({
                message: "Hotel not found",
            });
        }
        return res.status(200).json(result);
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

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

        return res.status(200).json(hotel)
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

exports.hotelRequest = async (req, res) => {
    try {
        const { hotelname, ownername, ownerphone, email, stateId, districtId, cityId, hoteladdress, totalrooms } = req.body

        if (!hotelname ||
            !ownername ||
            !ownerphone ||
            !email ||
            !stateId ||
            !districtId ||
            !cityId ||
            !hoteladdress ||
            !totalrooms
        ) {
            return res.status(400).json({
                message: "all fields are required"
            })
        }

        const existsHotel = await Hotelmodel.findOne({ email })
        if (existsHotel) {
            return res.status(400).json({
                message: "hotel already exists"
            })
        }

        const hotelRequestId = uuidv4().substring(0, 10)
        console.log(`>>>>>hotelRequestId`, hotelRequestId)

        const result = await Hotelmodel.create({
            hotelname,
            ownername,
            ownerphone,
            email,
            stateId,
            districtId,
            cityId,
            hoteladdress,
            totalrooms,
            hotelRequestId
        })

        await result.save();

        if (!result) {
            return res.status(400).json({
                message: "Hotel requesting error"
            })
        }
        await info(
            result.email,
            "Hotel Request Submitted Successfully",
            `
            <div style="font-family: Arial, sans-serif;">
                <h2>Hotel Registration Request Submitted</h2>

                <p>Dear <strong>${result.ownername}</strong>,</p>

                <p>Thank you for submitting your hotel registration request.</p>

                <h3>Your Request ID</h3>

                <div style="
                    background:#f5f5f5;
                    padding:15px;
                    font-size:24px;
                    font-weight:bold;
                    color:#0d6efd;
                    border-radius:8px;
                    width:fit-content;
                ">
                    ${result.hotelRequestId}
                </div>

                <br>

                <p>Please save this Request ID carefully.</p>

                <p>You can use this Request ID to check your hotel registration status anytime.</p>

                <hr>

                <p><strong>Hotel Name:</strong> ${result.hotelname}</p>
                <p><strong>Owner Name:</strong> ${result.ownername}</p>
                <p><strong>Email:</strong> ${result.email}</p>
                <p><strong>Total Rooms:</strong> ${result.totalrooms}</p>

                <br>

                <p>Regards,</p>

                <h4>Hotel Management Team</h4>

            </div>
            `
        );

        return res.status(201).json(result)

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}


exports.checkRequestId = async (req, res) => {
    try {

        const { requestId } = req.body
        if (!requestId) {
            return res.status(400).json({
                message: "Request ID is required"
            })
        }

        const existsRequest = await Hotelmodel.findOne({ hotelRequestId: requestId })
        if (!existsRequest) {
            return res.status(404).json({
                message: "NO Request Found"
            })
        }

        return res.status(200).json(existsRequest);
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

exports.updateRequest = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ message: "Hotel ID is required" });
        }

        const updatedHotel = await Hotelmodel.findByIdAndUpdate(
            id,
            req.body, // Updates the document with whatever is sent from the frontend
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

exports.hotelRequest = async (req, res) => {
    try {
        const {
            hotelname,
            ownername,
            ownerphone,
            email,
            stateId,
            districtId,
            cityId,
            hoteladdress,
            totalrooms
        } = req.body;

        if (
            !hotelname ||
            !ownername ||
            !ownerphone ||
            !email ||
            !stateId ||
            !districtId ||
            !cityId ||
            !hoteladdress ||
            !totalrooms
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingRecord = await Hotelmodel.findOne({ email });
        if (!existingRecord || !existingRecord.emailVerified) {
            return res.status(400).json({
                message: "Please verify your email before submitting."
            });
        }

        // ✅ CHANGE 1: Process and upload multiple files to Cloudinary if provided
        let imageUrls = [];
        if (req.files && req.files.images) {
            // express-fileupload structure wraps a single file as an object, and multiple files as an array.
            // Normalize it so uploadImage always gets an array/object dictionary.
            const filesToUpload = Array.isArray(req.files.images)
                ? req.files.images
                : [req.files.images];

            const uploadResults = await uploadImage(filesToUpload);
            imageUrls = uploadResults.map(result => result.secure_url);
        }

        const hotelRequestId = uuidv4().substring(0, 10);

        // ✅ CHANGE 2: Save the image URLs alongside the rest of the hotel details
        const result = await Hotelmodel.findOneAndUpdate(
            { email },
            {
                hotelname,
                ownername,
                ownerphone,
                stateId,
                districtId,
                cityId,
                hoteladdress,
                totalrooms,
                hotelRequestId,
                images: imageUrls, // Store the array of URLs
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
            result.email,
            "Hotel Request Submitted Successfully",
            `
            <div style="font-family: Arial, sans-serif;">
                <h2>Hotel Registration Request Submitted</h2>
                <p>Dear <strong>${result.ownername}</strong>,</p>
                <p>Thank you for submitting your hotel registration request.</p>
                <h3>Your Request ID</h3>
                <div style="background:#f5f5f5; padding:15px; font-size:24px; font-weight:bold; color:#0d6efd; border-radius:8px; width:fit-content;">
                    ${result.hotelRequestId}
                </div>
                <br>
                <p>You can use this Request ID to check your hotel registration status anytime.</p>
                <hr>
                <p><strong>Hotel Name:</strong> ${result.hotelname}</p>
                <p><strong>Owner Name:</strong> ${result.ownername}</p>
                <p><strong>Email:</strong> ${result.email}</p>
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
exports.sendhotelOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }
        const existing = await Hotelmodel.findOne({ email });

        if (existing && existing.emailVerified) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const generatedOTP = otp();
        console.log(`>>>>generatedOTP`, generatedOTP);

        let hotel = await Hotelmodel.findOne({ email });

        if (!hotel) {
            hotel = new Hotelmodel({
                email
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


exports.sendhotelOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const existing = await Hotelmodel.findOne({ email });

        if (existing && existing.emailVerified) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const generatedOTP = otp();
        console.log(`generatedOTP`, generatedOTP);

        // ✅ CHANGE: Look up or initialize a new document in MongoDB
        let hotel = await Hotelmodel.findOne({ email });

        if (!hotel) {
            hotel = new Hotelmodel({
                email
            });
        }

        hotel.otp = generatedOTP;
        hotel.expireTime = Date.now() + 5 * 60 * 1000;

        // ✅ CHANGE: Bypass schema validation to allow saving only the email and OTP
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

        const hotel = await Hotelmodel.findOne({ email });

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

        // ✅ CHANGE: Bypass validation to save verified status
        await hotel.save({ validateBeforeSave: false });

        res.json({
            message: "Email Verified"
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.hotelRequest = async (req, res) => {
    try {
        const {
            hotelname,
            ownername,
            ownerphone,
            email,
            stateId,
            districtId,
            cityId,
            hoteladdress,
            totalrooms
        } = req.body;

        if (
            !hotelname ||
            !ownername ||
            !ownerphone ||
            !email ||
            !stateId ||
            !districtId ||
            !cityId ||
            !hoteladdress ||
            !totalrooms
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // ✅ CHANGE: Verify that the email is already validated in MongoDB
        const existingRecord = await Hotelmodel.findOne({ email });
        if (!existingRecord || !existingRecord.emailVerified) {
            return res.status(400).json({
                message: "Please verify your email before submitting."
            });
        }

        const hotelRequestId = uuidv4().substring(0, 10);
        console.log("Hotel Request ID:", hotelRequestId);

        // ✅ CHANGE: Find and update the existing pre-verified document with the complete details
        const result = await Hotelmodel.findOneAndUpdate(
            { email },
            {
                hotelname,
                ownername,
                ownerphone,
                stateId,
                districtId,
                cityId,
                hoteladdress,
                totalrooms,
                hotelRequestId,
                status: "pending",
                isActive: true
            },
            { new: true } // Return updated document
        );

        if (!result) {
            return res.status(400).json({
                message: "Hotel requesting error"
            });
        }

        // Send confirmation email containing the Request ID
        await info(
            result.email,
            "Hotel Request Submitted Successfully",
            `
            <div style="font-family: Arial, sans-serif;">
                <h2>Hotel Registration Request Submitted</h2>
                <p>Dear <strong>${result.ownername}</strong>,</p>
                <p>Thank you for submitting your hotel registration request.</p>
                <h3>Your Request ID</h3>
                <div style="background:#f5f5f5; padding:15px; font-size:24px; font-weight:bold; color:#0d6efd; border-radius:8px; width:fit-content;">
                    ${result.hotelRequestId}
                </div>
                <br>
                <p>You can use this Request ID to check your hotel registration status anytime.</p>
                <hr>
                <p><strong>Hotel Name:</strong> ${result.hotelname}</p>
                <p><strong>Owner Name:</strong> ${result.ownername}</p>
                <p><strong>Email:</strong> ${result.email}</p>
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


