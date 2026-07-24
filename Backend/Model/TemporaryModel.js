const mongoose = require('mongoose')


const StateSchema = new mongoose.Schema({
    usreId: {
        type: mongoose.Types.ObjectId,
        ref: "user"
    },
    roomId: {
        type: mongoose.Types.ObjectId,
        ref: "roomdetails"
    },
    status: {
        type: String,
        default: "temporarybooked"
    },
    expiry:{
        type:Date,
        default: Date.now(),
        expire:600   
    }
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('states', StateSchema)
