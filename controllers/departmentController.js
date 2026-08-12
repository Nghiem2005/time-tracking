const Department = require("../models/Department");

// [POST] Thêm phòng ban mới (Chỉ Admin)
const createDepartment = async (req, res, next) => {
  try {
    const { departmentCode, name, description, status } = req.body;

    const departmentExists = await Department.findOne({ departmentCode });
    if (departmentExists) {
      return res
        .status(400)
        .json({ success: false, message: "Mã phòng ban đã tồn tại" });
    }

    const newDepartment = await Department.create({
      departmentCode,
      name,
      description,
      status,
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Tạo phòng ban thành công",
        data: newDepartment,
      });
  } catch (error) {
    next(error);
  }
};

// [GET] Lấy danh sách tất cả phòng ban
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find();
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

// [GET] Lấy chi tiết 1 phòng ban
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phòng ban" });
    res.status(200).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

// [PUT] Cập nhật phòng ban (Chỉ Admin)
const updateDepartment = async (req, res, next) => {
  try {
    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!updatedDepartment)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phòng ban" });
    res
      .status(200)
      .json({
        success: true,
        message: "Cập nhật thành công",
        data: updatedDepartment,
      });
  } catch (error) {
    next(error);
  }
};

// [DELETE] Xóa phòng ban (Chỉ Admin)
const deleteDepartment = async (req, res, next) => {
  try {
    const deletedDepartment = await Department.findByIdAndDelete(req.params.id);
    if (!deletedDepartment)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phòng ban" });
    res.status(200).json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
