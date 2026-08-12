const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: [true, "Vui lòng cung cấp mã nhân viên"],
    },
    leaveType: {
      type: String,
      enum: ["Nghỉ phép năm", "Nghỉ ốm", "Việc riêng", "Không lương"],
      required: [true, "Vui lòng chọn loại nghỉ phép"],
    },
    startDate: {
      type: Date,
      required: [true, "Vui lòng chọn ngày bắt đầu nghỉ"],
    },
    endDate: {
      type: Date,
      required: [true, "Vui lòng chọn ngày kết thúc nghỉ"],
    },
    reason: {
      type: String,
      required: [true, "Vui lòng nhập lý do xin nghỉ"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Chờ duyệt", "Đã duyệt", "Từ chối"],
      default: "Chờ duyệt",
    },
    approvedBy: {
      type: String, // Lưu mã hoặc tên Admin duyệt đơn
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Leave", leaveSchema);
