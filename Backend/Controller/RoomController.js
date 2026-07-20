const RoomModel = require("../Model/RoomModel");
const { uploadImage } = require("../Utils/Cloudinary");

// 1. Add New Room
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

    // Check if room number already exists for this specific hotel
    const existingRoom = await RoomModel.findOne({ hotelId, roomNumber });
    if (existingRoom) {
      return res.status(400).json({
        message: "Room number already exists in this hotel.",
      });
    }

    // Process image uploads via Cloudinary
    let imageUrls = [];
    if (req.files && req.files.images) {
      const filesToUpload = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];
      const uploadResults = await uploadImage(filesToUpload);
      imageUrls = uploadResults.map((result) => result.secure_url);
    }

    // Helper function to safely convert FormData string booleans ("true"/"false")
    const toBool = (val) => String(val) === "true";

    const newRoom = await RoomModel.create({
      hotelId,
      roomNumber: Number(roomNumber),
      floor: floor ? Number(floor) : 1,
      roomType: roomType || "Single",
      pricePerNight: Number(pricePerNight),
      capacity: capacity ? Number(capacity) : 2,
      images: imageUrls,

      // Bed Booleans
      kingSizeBed: toBool(kingSizeBed),
      queenSizeBed: toBool(queenSizeBed),
      singleBed: toBool(singleBed),
      doubleBed: toBool(doubleBed),

      // Facility & Amenity Booleans
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

      // Services
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

// 2. Get All Rooms (Populates Hotel details)
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

// 3. Update Room Details
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "Room ID is required." });
    }

    let updateData = { ...req.body };

    // Convert boolean flags if sent via FormData
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

    // Handle new image uploads if provided
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

// 4. Soft Delete (Deactivate Room)
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

// 5. Restore Room (Activate Room)
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

// 6. Delete Room Permanently
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

// 7. Direct Admin Add Room (Auto-activated & formatted)
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

    // Basic Validation
    if (!hotelId || !roomNumber || !pricePerNight) {
      return res.status(400).json({
        success: false,
        message: "Hotel ID, Room Number, and Price Per Night are mandatory.",
      });
    }

    // Check if this room number already exists in THIS specific hotel
    const roomExists = await RoomModel.findOne({
      hotelId,
      roomNumber: Number(roomNumber),
    });

    if (roomExists) {
      return res.status(400).json({
        success: false,
        message: `Room number ${roomNumber} already exists in this hotel.`,
      });
    }

    // Process Cloudinary Image Uploads
    let imageUrls = [];
    if (req.files && req.files.images) {
      const filesToUpload = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];
      const uploadResults = await uploadImage(filesToUpload);
      imageUrls = uploadResults.map((result) => result.secure_url);
    }

    // Convert string booleans ("true"/"false") safely
    const toBool = (val) => String(val) === "true";

    const room = await RoomModel.create({
      hotelId,
      roomNumber: Number(roomNumber),
      floor: floor ? Number(floor) : 1,
      roomType: roomType || "Single",
      pricePerNight: Number(pricePerNight),
      capacity: capacity ? Number(capacity) : 2,
      images: imageUrls,

      // Bed Options
      kingSizeBed: toBool(kingSizeBed),
      queenSizeBed: toBool(queenSizeBed),
      singleBed: toBool(singleBed),
      doubleBed: toBool(doubleBed),

      // Amenities & Facilities
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

      // Services
      roomService: toBool(roomService),
      laundryService: toBool(laundryService),
      housekeeping: toBool(housekeeping),

      // Admin direct entries are active and available by default
      isActive: true,
      isAvailable: true,
    });

    return res.status(201).json({
      success: true,
      message: "Room created and added to hotel configuration successfully!",
      room,
    });
  } catch (error) {
    console.error("Admin Add Room Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};