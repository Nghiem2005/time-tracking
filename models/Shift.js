const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    shiftCode: {
      type: String,
      required: [true, "Vui lòng nhập mã ca làm (Ví dụ: CA_SANG)"],
      unique: true,
      trim: true,
    },
    shiftName: {
      type: String,
      required: [true, "Vui lòng nhập tên ca (Ví dụ: Ca Sáng)"],
      trim: true,
    },
    startTime: {
      type: String,
      required: [
        true,
        "Vui lòng nhập giờ bắt đầu (Định dạng HH:mm, ví dụ: 07:30)",
      ],
      match: [
        /^([01]\d|2[0-3]):?([0-5]\d)$/,
        "Giờ bắt đầu không đúng định dạng HH:mm",
      ],
    },
    endTime: {
      type: String,
      required: [
        true,
        "Vui lòng nhập giờ kết thúc (Định dạng HH:mm, ví dụ: 11:30)",
      ],
      match: [
        /^([01]\d|2[0-3]):?([0-5]\d)$/,
        "Giờ kết thúc không đúng định dạng HH:mm",
      ],
    },
    breakTime: {
      type: Number, // Tính bằng phút (Ví dụ: nghỉ giữa giờ 30 phút)
      default: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Shift", shiftSchema);
