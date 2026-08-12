const mongoose = require("mongoose");

const checkinSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: true,
    },
    workplaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workplace",
      required: true,
    },

    // Thông tin Check-in
    checkInLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    distanceIn: { type: Number },

    // Thông tin Check-out
    checkOutTime: { type: Date },
    checkOutLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    distanceOut: { type: Number },

    // Tính toán & Trạng thái
    workHours: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Đang làm việc", "Đã tan ca", "Bất thường"],
      default: "Đang làm việc",
    },
  },
  { timestamps: true },
);

// Quan trọng nhất là dòng này: Phải export đúng tên Model
module.exports = mongoose.model("CheckIn", checkinSchema);
