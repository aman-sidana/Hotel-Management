const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
    {
        hotelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "HotelDetails", // FIXED: Added quotes
            required: true,
        },
        roomNumber: {
            type: Number,
            required: true,
            // REMOVED unique: true here so different hotels can use room #101
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
        // Images uploaded to Cloudinary
        images: {
            type: [String],
            default: [],
        },
        // Beds
        kingSizeBed: { type: Boolean, default: false },
        queenSizeBed: { type: Boolean, default: false },
        singleBed: { type: Boolean, default: false },
        doubleBed: { type: Boolean, default: false },

        // Amenities & Facilities
        ac: { type: Boolean, default: false },
        cooler: { type: Boolean, default: false },
        attachedBathroom: { type: Boolean, default: false },
        bathtub: { type: Boolean, default: false },
        geyser: { type: Boolean, default: false },
        tv: { type: Boolean, default: false },
        wifi: { type: Boolean, default: false },
        telephone: { type: Boolean, default: false },
        miniFridge: { type: Boolean, default: false },
        microwave: { type: Boolean, default: false },
        electricKettle: { type: Boolean, default: false },
        sofa: { type: Boolean, default: false },
        diningTable: { type: Boolean, default: false },
        wardrobe: { type: Boolean, default: false },
        balcony: { type: Boolean, default: false },
        locker: { type: Boolean, default: false },
        smokeDetector: { type: Boolean, default: false },
        fireExtinguisher: { type: Boolean, default: false },

        // Services
        roomService: { type: Boolean, default: false },
        laundryService: { type: Boolean, default: false },
        housekeeping: { type: Boolean, default: false },

        // Status flags
        isAvailable: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Ensures a roomNumber is unique ONLY within the same hotel
RoomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model("RoomDetails", RoomSchema);