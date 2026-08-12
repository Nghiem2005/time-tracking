const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: [true, "Vui lòng nhập mã nhân viên"],
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, "Vui lòng nhập họ tên"],
    },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Vui lòng nhập email hợp lệ",
      ],
    },
    password: {
      type: String,
      required: [true, "Vui lòng nhập mật khẩu"],
      select: false, // Mặc định sẽ không trả về password khi truy vấn dữ liệu
    },
    role: {
      type: String,
      enum: ["Admin", "Manager", "Employee"],
      default: "Employee",
    },
    phone: { type: String },
    department: { type: String }, // Tạm thời để String, sau này có thể nối bảng Department
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true },
);

// Xử lý logic: Tự động mã hóa mật khẩu TRƯỚC KHI lưu vào Database
employeeSchema.pre("save", async function () {
  // Nếu password không bị thay đổi (ví dụ lúc update thông tin khác) thì bỏ qua
  if (!this.isModified("password")) {
    return;
  }

  // Tạo chuỗi salt và mã hóa
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Hàm nghiệp vụ: So sánh mật khẩu người dùng nhập vào với mật khẩu đã mã hóa trong DB
employeeSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Employee", employeeSchema);
