const Overtime = require("../models/Overtime");

// Hàm tính số giờ làm thêm từ chuỗi HH:mm
const calculateHours = (startTime, endTime) => {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  let diff = endMin - startMin;
  if (diff < 0) diff += 24 * 60; // qua nửa đêm
  return Math.round((diff / 60) * 100) / 100;
};

// [POST] Nhân viên đăng ký làm thêm
const createOvertime = async (req, res, next) => {
  try {
    const { date, startTime, endTime, reason } = req.body;
    const employeeCode = req.employee.employeeCode;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ: ngày, giờ bắt đầu, giờ kết thúc",
      });
    }

    const hours = calculateHours(startTime, endTime);

    const newOvertime = await Overtime.create({
      employeeCode,
      date,
      startTime,
      endTime,
      hours,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Đăng ký làm thêm thành công, vui lòng chờ duyệt!",
      data: newOvertime,
    });
  } catch (error) {
    next(error);
  }
};

// [GET] Danh sách đăng ký làm thêm (NV thấy của mình, Admin/Manager thấy tất cả)
const getOvertimes = async (req, res, next) => {
  try {
    let query = {};
    if (req.employee.role === "Employee") {
      query.employeeCode = req.employee.employeeCode;
    }

    const overtimes = await Overtime.find(query).sort({ date: -1 });
    res.status(200).json({
      success: true,
      count: overtimes.length,
      data: overtimes,
    });
  } catch (error) {
    next(error);
  }
};

// [GET] Chi tiết 1 đăng ký làm thêm
const getOvertimeById = async (req, res, next) => {
  try {
    const overtime = await Overtime.findById(req.params.id);
    if (!overtime) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đăng ký làm thêm" });
    }
    res.status(200).json({ success: true, data: overtime });
  } catch (error) {
    next(error);
  }
};

// [PUT] Admin duyệt / từ chối đăng ký làm thêm
const updateOvertimeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["Đã duyệt", "Từ chối"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Trạng thái duyệt không hợp lệ" });
    }

    const overtime = await Overtime.findById(req.params.id);
    if (!overtime) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đăng ký làm thêm" });
    }

    overtime.status = status;
    overtime.approvedBy = req.employee.employeeCode;
    await overtime.save();

    res.status(200).json({
      success: true,
      message: `Đã cập nhật trạng thái thành: ${status}`,
      data: overtime,
    });
  } catch (error) {
    next(error);
  }
};

// [DELETE] Xóa đăng ký làm thêm (Admin hoặc chính nhân viên)
const deleteOvertime = async (req, res, next) => {
  try {
    const overtime = await Overtime.findById(req.params.id);
    if (!overtime) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đăng ký làm thêm" });
    }

    // Chỉ Admin hoặc chính nhân viên tạo đơn mới được xóa
    if (
      req.employee.role !== "Admin" &&
      overtime.employeeCode !== req.employee.employeeCode
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa đăng ký này",
      });
    }

    await overtime.deleteOne();
    res.status(200).json({
      success: true,
      message: "Xóa đăng ký làm thêm thành công",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOvertime,
  getOvertimes,
  getOvertimeById,
  updateOvertimeStatus,
  deleteOvertime,
};
