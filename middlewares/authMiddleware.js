const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

const protect = async (req, res, next) => {
  let token;

  // 1. Kiểm tra xem request có gửi kèm token trong phần Header không
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Cắt bỏ chữ "Bearer " để lấy đúng chuỗi token
    token = req.headers.authorization.split(" ")[1];
  }

  // Nếu không có token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Truy cập bị từ chối. Vui lòng đăng nhập!",
    });
  }

  try {
    // 2. Giải mã token để lấy ID của nhân viên (sử dụng đúng Secret Key đã tạo lúc nãy)
    const decoded = jwt.verify(token, "GDU_Secret_Key_2026");

    // 3. Tìm nhân viên trong Database và gắn thông tin vào req.employee
    req.employee = await Employee.findById(decoded.id);

    // Nếu token hợp lệ nhưng nhân viên không còn tồn tại trong DB
    if (!req.employee) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản không tồn tại. Vui lòng đăng nhập lại!",
      });
    }

    // Cho phép đi tiếp vào Controller xử lý
    next();
  } catch (error) {
    console.log("Nguyên nhân lỗi Token:", error.message);

    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn.",
    });
  }
};

// Hàm kiểm tra quyền hạn (Role)
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.employee đã được tạo ra từ hàm protect trước đó
    if (!roles.includes(req.employee.role)) {
      return res.status(403).json({
        success: false,
        message: `Tài khoản [${req.employee.role}] không có quyền thực hiện hành động này.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
