const TemporaryModel = require("../Model/TemporaryModel")
const RoomModel = require("../Model/RoomModel")
const UserModel = require("../Model/UserModel")

exports.temporarydata = async (req, res) => {
    try {
        const { roomId, userId } = req.body
        if (!roomId || !userId) {
            return res.status(400).json({
                message: "Room and User Id is required"
            })
        }

        const existroom = await RoomModel.findById(roomId)
        if (!existroom) {
            return res.status(4004).json({
                message: "Room not Found"
            })
        }

        const result = await TemporaryModel.create({ roomId, userId })
        if (!result) {
            return res.status(400).json({
                message: "data is note created"
            })
        }

        return res.status(200).json(result)

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

exports.temporaryget = async (req, res) => {
    try {
        const { roomId } = req.body
        if (!roomId || !userId) {
            return res.status(400).json({
                message: "Room and User Id is required"
            })
        }
        const result = await this.TemporaryModel.findById(roomId)
        if(!result){
            return res.status(404).json({
                message:"room not found"
            })
        }
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}