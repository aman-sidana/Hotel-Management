const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema({
    ownername: {
        type: String,
        required: true
    },
    ownerphone: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    permanentaddress: {
        type: String,
        required: true
    },
    currentaddress: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: "pending",
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: {
        type: String
    },
    otp: {
        type: String
    },
    expireTime: {
        type: Date
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    AdminRequestId: {
        type: String
    },
    profileimage: {
        type: String,
    },
    addhar:{
        type:[String],
        default:[]
    }
},
    {
        createdAt: false,
        timestamps: true,
        versionKey: false,
        updatedAt: false
    })

module.exports = mongoose.model('admin', AdminSchema)
