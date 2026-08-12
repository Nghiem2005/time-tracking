const Employee = require("../models/Employee");
const jwt = require("jsonwebtoken");

// Hàm hỗ trợ tạo Token (dùng chung với authController)
const generateToken = (id) => {
  return jwt.sign({ id }, "GDU_Secret_Key_2026", {
    expiresIn: "30d",
  });
};

// [GET] Danh sách tất cả nhân viên (Admin/Manager)
const getEmployees = async (req, res, next) => {
  try {
    const { role, department, status, keyword } = req.query;
    let query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (status) query.status = status;
    if (keyword) {
      query.$or = [
        { fullName: { $regex: keyword, $options: "i" } },
        { employeeCode: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ];
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// [GET] Chi tiết 1 nhân viên theo ID
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy nhân viên" });
    }
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// [POST] Thêm mới nhân viên (Admin)
const createEmployee = async (req, res, next) => {
  try {
    const {
      employeeCode,
      fullName,
      email,
      password,
      role,
      phone,
      department,
      status,
    } = req.body;

    if (!employeeCode || !fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ: mã NV, họ tên, email, mật khẩu",
      });
    }

    const employeeExists = await Employee.findOne({
      $or: [{ email }, { employeeCode }],
    });
    if (employeeExists) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc Mã nhân viên đã được sử dụng",
      });
    }

    const employee = await Employee.create({
      employeeCode,
      fullName,
      email,
      password,
      role,
      phone,
      department,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Thêm nhân viên thành công",
      data: {
        _id: employee._id,
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
        phone: employee.phone,
        department: employee.department,
        status: employee.status,
        token: generateToken(employee._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// [PUT] Cập nhật thông tin nhân viên (Admin)
const updateEmployee = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;

    // Nếu có password mới thì cập nhật (pre-save sẽ tự băm)
    if (password) {
      updateData.password = password;
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy nhân viên" });
    }

    // Kiểm tra trùng email/mã nếu có thay đổi
    if (updateData.email || updateData.employeeCode) {
      const exists = await Employee.findOne({
        _id: { $ne: req.params.id },
        $or: [
          { email: updateData.email },
          { employeeCode: updateData.employeeCode },
        ],
      });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Email hoặc Mã nhân viên đã được sử dụng",
        });
      }
    }

    Object.assign(employee, updateData);
    await employee.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật nhân viên thành công",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// [DELETE] Xóa nhân viên (Admin)
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy nhân viên" });
    }
    res.status(200).json({
      success: true,
      message: "Xóa nhân viên thành công",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
