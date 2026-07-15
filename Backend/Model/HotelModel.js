const mongoose = require('mongoose')

const HotelSchema = new mongoose.Schema({
    hotelname: {
        type: String,
        required: true
    },
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
    stateId:{
        type:mongoose.Types.ObjectId,
        ref:"states"
    },
    districtId:{
        type:mongoose.Types.ObjectId,
        ref:"districts"
    },
    cityId:{
        type:mongoose.Types.ObjectId,
        ref:"cities"
    },
    hoteladdress: {
        type: String,
        default: "user"
    },
    totalrooms: {
        type: String,
        default: "light"
    },

},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('HotelDetails', HotelSchema)
