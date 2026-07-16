const Hotelmodel = require("../Model/HotelModel")

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
        })
        if (!result) {
            return res.status(400).json({
                message: "Hotel requesting error"
            })
        }

        return res.status(201).json(result)

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

exports.approveRequest = async (req, res) => {
    try {
        const { id } = req.query
        if (!id) {
            return res.status(400).json({
                message: "Hotel Id not Found"
            })
        }

        const result = await Hotelmodel.findByIdAndUpdate(id, { status: "approved" }, { new: true })
        if (!result) {
            return res.status(404).json({
                message: "Hotel not Found"
            })
        }

        return res.status(200).json(result)

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

exports.rejectRequest = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                message: "Hotel ID is required",
            });
        }

        const result = await Hotelmodel.findByIdAndUpdate(
            id,
            { status: "rejected" },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                message: "Hotel not found",
            });
        }

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