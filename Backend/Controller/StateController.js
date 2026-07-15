const StateModel = require("../Model/StateModel")

exports.addState = async (req, res) => {
    try {

        const { countryName = "India", stateName } = req.body;

        if (!stateName) {
            return res.status(400).json({
                message: "State Name is required",
            });
        }

        const existState = await StateModel.findOne({
            stateName,
            countryName,
        });

        if (existState) {
            return res.status(400).json({
                message: "State already exists",
            });
        }

        const state = await StateModel.create({
            countryName,
            stateName,
        });

        return res.status(201).json({
            message: "State added successfully",
            state,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

exports.deleteState = async (req, res) => {
    try {
        const { id } = req.query
        if (!id) {
            return res.status(404).json({
                message: "Id not found"
            })
        }

        const result = await StateModel.findByIdAndDelete(id)

        if (!result) {
            return res.status(404).json({
                message: "State not found",
            });
        }

        return res.status(200).json(result)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "internal server error"
        })
    }
}

exports.getAllState = async (req, res) => {
    try {
        const states = await StateModel.find()

        if (!states) {
            return res.status(404).json({
                message: "states not found"
            })
        }

        return res.status(200).json(states)
    }
    catch (error) {
        return res.status(500).json({
            message: "Interanl Server Error"
        })
    }
}

exports.updatestate = async (req, res) => {
    try {
        const { id } = req.query
        if (!id) {
            return res.status(404).json({
                message: "Id not found of state"
            })
        }
        const { stateName } = req.body
        if (!stateName) {
            return res.status(404).json({
                message: "Fill StateName fields to update"
            })
        }

        const result = await StateModel.findByIdAndUpdate(id, { stateName }, { new: true })
        if (!result) {
            return res.status(404).json({
                message: "state not found"
            })
        }
        return res.status(200).json({

        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Serever Error"
        })
    }
}

exports.softDeleteState = async (req, res) => {
    try {
        const { id } = req.query
        if (!id) {
            return res.status(404).json({
                message: "Id not found"
            })
        }
        const findstate = await StateModel.findByIdAndUpdate(id, { status: false }, { new: true })
        if (!findstate) {
            return res.status(404).json({
                message: "soft deleting state error"
            })
        }
        return res.status(200).json({
            message: "State soft deleted successfully",
            state: findstate,
        });

    } catch (error) {
        return res.status(500).json({
            message: "internal server error"
        })
    }
}

exports.restoreState = async (req, res) => {
    try {
        const { id } = req.query
        if (!id) {
            return res.status(400).json({
                message: "Id not found"
            })
        }
        const findstate = await StateModel.findByIdAndUpdate(id, { status: true }, { new: true })
        if (!findstate) {
            return res.status(404).json({
                message: "soft deleting state error"
            })
        }
        return res.status(200).json({
            message: "State soft deleted successfully",
            state: findstate,
        });

    } catch (error) {
        return res.status(500).json({
            message: "internal server error"
        })
    }
}
