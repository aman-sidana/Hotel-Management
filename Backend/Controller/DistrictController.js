const DistrictModel = require("../Model/DistrictModel");
const StateModel = require("../Model/StateModel");

// Add District
exports.addDistrict = async (req, res) => {
    try {

        const { districtName, stateId } = req.body;

        if (!districtName || !stateId) {
            return res.status(400).json({
                message: "District Name and State are required",
            });
        }

        const state = await StateModel.findById(stateId);

        if (!state) {
            return res.status(404).json({
                message: "State not found",
            });
        }

        const existDistrict = await DistrictModel.findOne({
            districtName,
            stateId,
        });

        if (existDistrict) {
            return res.status(400).json({
                message: "District already exists in this state",
            });
        }

        const district = await DistrictModel.create({
            districtName,
            stateId,
        });

        return res.status(201).json({
            message: "District added successfully",
            district,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

exports.getAllDistrict = async (req, res) => {
    try {

        const districts = await DistrictModel.find()
            .populate({
                path: "stateId",
                select: "stateName",
            });

        return res.status(200).json(districts);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

exports.updateDistrict = async (req, res) => {
    try {

        const { id } = req.query;
        const { districtName, stateId } = req.body;

        const district = await DistrictModel.findByIdAndUpdate(
            id,
            {
                districtName,
                stateId,
            },
            { new: true }
        );

        if (!district) {
            return res.status(404).json({
                message: "District not found",
            });
        }

        return res.status(200).json({
            message: "District updated successfully",
            district,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

exports.deleteDistrict = async (req, res) => {
    try {

        const { id } = req.query;

        const district = await DistrictModel.findByIdAndDelete(id);

        if (!district) {
            return res.status(404).json({
                message: "District not found",
            });
        }

        return res.status(200).json({
            message: "District deleted successfully",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

// Soft Delete
exports.softDeleteDistrict = async (req, res) => {
    try {

        const { id } = req.query;

        const district = await DistrictModel.findByIdAndUpdate(
            id,
            { status: false },
            { new: true }
        );

        if (!district) {
            return res.status(404).json({
                message: "District not found",
            });
        }

        return res.status(200).json({
            message: "District soft deleted",
            district,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

exports.restoreDistrict = async (req, res) => {
    try {

        const { id } = req.query;

        const district = await DistrictModel.findByIdAndUpdate(
            id,
            { status: true },
            { new: true }
        );

        if (!district) {
            return res.status(404).json({
                message: "District not found",
            });
        }

        return res.status(200).json({
            message: "District restored",
            district,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};