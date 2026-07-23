const RoomModel = require("../Model/RoomModel");
const { uploadImage } = require("../Utils/Cloudinary");

exports.addRoom = async (req, res) => {
  try {
    const {
      hotelId,
      roomNumber,
      floor,
      roomType,
      pricePerNight,
      capacity,
      kingSizeBed,
      queenSizeBed,
      singleBed,
      doubleBed,
      ac,
      cooler,
      attachedBathroom,
      bathtub,
      geyser,
      tv,
      wifi,
      telephone,
      miniFridge,
      microwave,
      electricKettle,
      sofa,
      diningTable,
      wardrobe,
      balcony,
      locker,
      smokeDetector,
      fireExtinguisher,
      roomService,
      laundryService,
      housekeeping,
    } = req.body;

    if (!hotelId || !roomNumber || !pricePerNight) {
      return res.status(400).json({
        message: "Hotel ID, Room Number, and Price Per Night are required.",
      });
    }

    const existingRoom = await RoomModel.findOne({ hotelId, roomNumber });
    if (existingRoom) {
      return res.status(400).json({
        message: "Room number already exists in this hotel.",
      });
    }

    let imageUrls = [];
    if (req.files && req.files.images) {
      const filesToUpload = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];
      const uploadResults = await uploadImage(filesToUpload);
      imageUrls = uploadResults.map((result) => result.secure_url);
    }

    const toBool = (val) => String(val) === "true";

    const newRoom = await RoomModel.create({
      hotelId,
      roomNumber: Number(roomNumber),
      floor: floor ? Number(floor) : 1,
      roomType: roomType || "Single",
      pricePerNight: Number(pricePerNight),
      capacity: capacity ? Number(capacity) : 2,
      images: imageUrls,

      kingSizeBed: toBool(kingSizeBed),
      queenSizeBed: toBool(queenSizeBed),
      singleBed: toBool(singleBed),
      doubleBed: toBool(doubleBed),

      ac: toBool(ac),
      cooler: toBool(cooler),
      attachedBathroom: toBool(attachedBathroom),
      bathtub: toBool(bathtub),
      geyser: toBool(geyser),
      tv: toBool(tv),
      wifi: toBool(wifi),
      telephone: toBool(telephone),
      miniFridge: toBool(miniFridge),
      microwave: toBool(microwave),
      electricKettle: toBool(electricKettle),
      sofa: toBool(sofa),
      diningTable: toBool(diningTable),
      wardrobe: toBool(wardrobe),
      balcony: toBool(balcony),
      locker: toBool(locker),
      smokeDetector: toBool(smokeDetector),
      fireExtinguisher: toBool(fireExtinguisher),

      roomService: toBool(roomService),
      laundryService: toBool(laundryService),
      housekeeping: toBool(housekeeping),

      isActive: true,
      isAvailable: true,
    });

    return res.status(201).json({
      message: "Room created successfully!",
      room: newRoom,
    });
  } catch (error) {
    console.error("Add Room Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await RoomModel.find().populate(
      "hotelId",
      "hotelname hotelemail hotelphone ownername"
    );
    return res.status(200).json(rooms);
  } catch (error) {
    console.error("Get All Rooms Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "Room ID is required." });
    }

    let updateData = { ...req.body };

    const booleanFields = [
      "kingSizeBed", "queenSizeBed", "singleBed", "doubleBed",
      "ac", "cooler", "attachedBathroom", "bathtub", "geyser", "tv",
      "wifi", "telephone", "miniFridge", "microwave", "electricKettle",
      "sofa", "diningTable", "wardrobe", "balcony", "locker",
      "smokeDetector", "fireExtinguisher", "roomService",
      "laundryService", "housekeeping", "isAvailable", "isActive"
    ];

    booleanFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        updateData[field] = String(updateData[field]) === "true";
      }
    });

    if (req.files && req.files.images) {
      const filesToUpload = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];
      const uploadResults = await uploadImage(filesToUpload);
      updateData.images = uploadResults.map((result) => result.secure_url);
    }

    const updatedRoom = await RoomModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found." });
    }

    return res.status(200).json({
      message: "Room updated successfully!",
      room: updatedRoom,
    });
  } catch (error) {
    console.error("Update Room Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.softDeleteRoom = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "Room ID is required." });

    const room = await RoomModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    return res.status(200).json({ message: "Room deactivated successfully.", room });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.restoreRoom = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "Room ID is required." });

    const room = await RoomModel.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );
    return res.status(200).json({ message: "Room activated successfully.", room });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "Room ID is required." });

    await RoomModel.findByIdAndDelete(id);
    return res.status(200).json({ message: "Room deleted permanently." });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.adminAddRoom = async (req, res) => {
  try {
    const {
      hotelId,
      roomNumber,
      floor,
      roomType,
      pricePerNight,
      capacity,
      kingSizeBed,
      queenSizeBed,
      singleBed,
      doubleBed,
      ac,
      cooler,
      attachedBathroom,
      bathtub,
      geyser,
      tv,
      wifi,
      telephone,
      miniFridge,
      microwave,
      electricKettle,
      sofa,
      diningTable,
      wardrobe,
      balcony,
      locker,
      smokeDetector,
      fireExtinguisher,
      roomService,
      laundryService,
      housekeeping,
    } = req.body;

    if (!hotelId || !roomNumber || !pricePerNight) {
      return res.status(400).json({

        message: "Hotel ID, Room Number, and Price Per Night are mandatory.",
      });
    }

    const roomExists = await RoomModel.findOne({
      hotelId,
      roomNumber: Number(roomNumber),
    });

    if (roomExists) {
      return res.status(400).json({
        message: `Room number ${roomNumber} already exists in this hotel.`,
      });
    }

    let imageUrls = [];
    if (req.files && req.files.images) {
      const filesToUpload = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];
      const uploadResults = await uploadImage(filesToUpload);
      imageUrls = uploadResults.map((result) => result.secure_url);
    }

    const toBool = (val) => String(val) === "true";

    const room = await RoomModel.create({
      hotelId,
      roomNumber: Number(roomNumber),
      floor: floor ? Number(floor) : 1,
      roomType: roomType || "Single",
      pricePerNight: Number(pricePerNight),
      capacity: capacity ? Number(capacity) : 2,
      images: imageUrls,
      kingSizeBed: toBool(kingSizeBed),
      queenSizeBed: toBool(queenSizeBed),
      singleBed: toBool(singleBed),
      doubleBed: toBool(doubleBed),
      ac: toBool(ac),
      cooler: toBool(cooler),
      attachedBathroom: toBool(attachedBathroom),
      bathtub: toBool(bathtub),
      geyser: toBool(geyser),
      tv: toBool(tv),
      wifi: toBool(wifi),
      telephone: toBool(telephone),
      miniFridge: toBool(miniFridge),
      microwave: toBool(microwave),
      electricKettle: toBool(electricKettle),
      sofa: toBool(sofa),
      diningTable: toBool(diningTable),
      wardrobe: toBool(wardrobe),
      balcony: toBool(balcony),
      locker: toBool(locker),
      smokeDetector: toBool(smokeDetector),
      fireExtinguisher: toBool(fireExtinguisher),

      roomService: toBool(roomService),
      laundryService: toBool(laundryService),
      housekeeping: toBool(housekeeping),

      isActive: true,
      isAvailable: true,
    });

    return res.status(201).json({

      message: "Room created and added to hotel configuration successfully!",
      room,
    });
  } catch (error) {
    console.error("Admin Add Room Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.viewdetails = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        message: "Room ID is required.",
      });
    }

    const room = await RoomModel.findById(id).populate(
      "hotelId",
      "hotelname hotelemail hotelphone ownername"
    );

    if (!room) {
      return res.status(404).json({
        message: "Room not found.",
      });
    }

    return res.status(200).json( room);
  } catch (error) {
    console.error("View Room Details Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};