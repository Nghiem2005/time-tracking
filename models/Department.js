const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    departmentCode: {
      type: String,
      required: [true, "Vui lòng nhập mã phòng ban (Ví dụ: IT, HR, MKT)"],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên phòng ban"],
      trim: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active", // Phòng ban đang hoạt động hay đã giải thể
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Department", departmentSchema);
