const Employee = require("../models/Employee");
const jwt = require("jsonwebtoken");

// Hàm hỗ trợ tạo Token
const generateToken = (id) => {
  // Trong thực tế, chuỗi 'GDU_Secret_Key_2026' nên được giấu trong file .env
  // Thời hạn token là 30 ngày
  return jwt.sign({ id }, "GDU_Secret_Key_2026", {
    expiresIn: "30d",
  });
};

// [POST] Đăng ký nhân viên mới (Register)
const register = async (req, res, next) => {
  try {
    const { employeeCode, fullName, email, password, role, phone, department } =
      req.body;

    // 1. Kiểm tra xem email hoặc mã nhân viên đã tồn tại chưa
    const employeeExists = await Employee.findOne({
      $or: [{ email }, { employeeCode }],
    });

    if (employeeExists) {
      const error = new Error("Email hoặc Mã nhân viên đã được sử dụng");
      error.statusCode = 400;
      throw error;
    }

    // 2. Tạo nhân viên mới (Mongoose tự động băm password nhờ pre-save đã viết ở Model)
    const employee = await Employee.create({
      employeeCode,
      fullName,
      email,
      password,
      role,
      phone,
      department,
    });

    // 3. Trả về kết quả kèm Token
    res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công",
      data: {
        _id: employee._id,
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
        token: generateToken(employee._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// [POST] Đăng nhập (Login)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("Vui lòng cung cấp email và mật khẩu");
      error.statusCode = 400;
      throw error;
    }

    // 1. Tìm user theo email. Phải thêm .select('+password') vì trong Model ta đã ẩn nó đi
    const employee = await Employee.findOne({ email }).select("+password");

    if (!employee) {
      const error = new Error("Email hoặc mật khẩu không chính xác");
      error.statusCode = 401;
      throw error;
    }

    // 2. Kiểm tra mật khẩu (Sử dụng hàm matchPassword đã viết trong Model)
    const isMatch = await employee.matchPassword(password);
    if (!isMatch) {
      const error = new Error("Email hoặc mật khẩu không chính xác");
      error.statusCode = 401;
      throw error;
    }

    // 3. Đăng nhập thành công, cấp Token
    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        _id: employee._id,
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
        token: generateToken(employee._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
