const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({

    roomNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    floor: {
        type: Number,
        default: 1,
    },
    roomType: {
        type: String,
        enum: ["Single", "Double", "Twin", "Deluxe", "Suite", "Family"],
        default: "Single",
    },
    pricePerNight: {
        type: Number,
        required: true,
    },
    capacity: {
        type: Number,
        default: 2,
    },
    kingSizeBed: {
        type: Boolean,
        default: false,
    },
    queenSizeBed: {
        type: Boolean,
        default: false,
    },
    singleBed: {
        type: Boolean,
        default: false,
    },
    doubleBed: {
        type: Boolean,
        default: false,
    },
    ac: {
        type: Boolean,
        default: false,
    },
    cooler: {
        type: Boolean,
        default: false,
    },
    attachedBathroom: {
        type: Boolean,
        default: false,
    },
    bathtub: {
        type: Boolean,
        default: false,
    },
    geyser: {
        type: Boolean,
        default: false,
    },
    tv: {
        type: Boolean,
        default: false,
    },
    wifi: {
        type: Boolean,
        default: false,
    },
    telephone: {
        type: Boolean,
        default: false,
    },
    miniFridge: {
        type: Boolean,
        default: false,
    },
    microwave: {
        type: Boolean,
        default: false,
    },
    electricKettle: {
        type: Boolean,
        default: false,
    },
    sofa: {
        type: Boolean,
        default: false,
    },
    diningTable: {
        type: Boolean,
        default: false,
    },
    wardrobe: {
        type: Boolean,
        default: false,
    },
    balcony: {
        type: Boolean,
        default: false,
    },
    locker: {
        type: Boolean,
        default: false,
    },
    smokeDetector: {
        type: Boolean,
        default: false,
    },
    fireExtinguisher: {
        type: Boolean,
        default: false,
    },
    roomService: {
        type: Boolean,
        default: false,
    },
    laundryService: {
        type: Boolean,
        default: false,
    },
    housekeeping: {
        type: Boolean,
        default: false,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    hotelId: {
        type: mongoose.Types.ObjectId,
        ref: HotelDetails
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model("Room", RoomSchema);