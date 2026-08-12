const mongoose = require("mongoose");

const overtimeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: [true, "Vui lòng cung cấp mã nhân viên"],
    },
    date: {
      type: Date,
      required: [true, "Vui lòng chọn ngày làm thêm"],
    },
    startTime: {
      type: String,
      required: [true, "Vui lòng nhập giờ bắt đầu (HH:mm)"],
      match: [
        /^([01]\d|2[0-3]):?([0-5]\d)$/,
        "Giờ bắt đầu không đúng định dạng HH:mm",
      ],
    },
    endTime: {
      type: String,
      required: [true, "Vui lòng nhập giờ kết thúc (HH:mm)"],
      match: [
        /^([01]\d|2[0-3]):?([0-5]\d)$/,
        "Giờ kết thúc không đúng định dạng HH:mm",
      ],
    },
    hours: {
      type: Number,
      default: 0,
    },
    reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Chờ duyệt", "Đã duyệt", "Từ chối"],
      default: "Chờ duyệt",
    },
    approvedBy: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Overtime", overtimeSchema);
