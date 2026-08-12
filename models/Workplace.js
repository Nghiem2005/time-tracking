const mongoose = require("mongoose");

const workplaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên chi nhánh/nơi làm việc"],
    },
    address: {
      type: String,
      required: [true, "Vui lòng nhập địa chỉ cụ thể"],
    },
    // Lưu tọa độ trả về từ OpenStreetMap API
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  {
    timestamps: true, // Tự động tạo trường createdAt và updatedAt
  },
);

module.exports = mongoose.model("Workplace", workplaceSchema);
