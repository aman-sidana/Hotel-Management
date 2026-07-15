const CityModel = require("../Model/CityModel");
const DistrictModel = require("../Model/DistrictModel");

// Add City
exports.addCity = async (req, res) => {
    try {

        const { cityName, districtId } = req.body;

        if (!cityName || !districtId) {
            return res.status(400).json({
                message: "City Name and District are required",
            });
        }

        // Check District
        const district = await DistrictModel.findById(districtId);

        if (!district) {
            return res.status(404).json({
                message: "District not found",
            });
        }

        // Duplicate Check
        const existCity = await CityModel.findOne({
            cityName,
            districtId,
        });

        if (existCity) {
            return res.status(400).json({
                message: "City already exists in this district",
            });
        }

        const city = await CityModel.create({
            cityName,
            districtId,
        });

        return res.status(201).json({
            message: "City added successfully",
            city,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

// Get All Cities
exports.getAllCity = async (req, res) => {
    try {

        const cities = await CityModel.find()
            .populate({
                path: "districtId",
                select: "districtName",
            });

        return res.status(200).json(cities);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

// Update City
exports.updateCity = async (req, res) => {
    try {

        const { id } = req.query;
        const { cityName, districtId } = req.body;

        const city = await CityModel.findByIdAndUpdate(
            id,
            {
                cityName,
                districtId,
            },
            { new: true }
        );

        if (!city) {
            return res.status(404).json({
                message: "City not found",
            });
        }

        return res.status(200).json({
            message: "City updated successfully",
            city,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

// Delete City
exports.deleteCity = async (req, res) => {
    try {

        const { id } = req.query;

        const city = await CityModel.findByIdAndDelete(id);

        if (!city) {
            return res.status(404).json({
                message: "City not found",
            });
        }

        return res.status(200).json({
            message: "City deleted successfully",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

// Soft Delete
exports.softDeleteCity = async (req, res) => {
    try {

        const { id } = req.query;

        const city = await CityModel.findByIdAndUpdate(
            id,
            { status: false },
            { new: true }
        );

        if (!city) {
            return res.status(404).json({
                message: "City not found",
            });
        }

        return res.status(200).json({
            message: "City soft deleted",
            city,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

// Restore City
exports.restoreCity = async (req, res) => {
    try {

        const { id } = req.query;

        const city = await CityModel.findByIdAndUpdate(
            id,
            { status: true },
            { new: true }
        );

        if (!city) {
            return res.status(404).json({
                message: "City not found",
            });
        }

        return res.status(200).json({
            message: "City restored",
            city,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};