const Leave = require("../models/Leave");

// [POST] Nhân viên tạo đơn xin nghỉ phép
const createLeaveRequest = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employeeCode = req.employee.employeeCode;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Vui lòng nhập đầy đủ thông tin đơn nghỉ phép",
        });
    }

    const newLeave = await Leave.create({
      employeeCode,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Gửi đơn xin nghỉ phép thành công, vui lòng chờ duyệt!",
      data: newLeave,
    });
  } catch (error) {
    next(error);
  }
};

// [GET] Xem danh sách đơn (Nhân viên chỉ thấy đơn của mình, Admin thấy tất cả)
const getLeaveRequests = async (req, res, next) => {
  try {
    let query = {};
    // Nếu không phải Admin, chỉ lọc lấy đơn của chính nhân viên đó
    if (req.employee.role !== "Admin") {
      query.employeeCode = req.employee.employeeCode;
    }

    const leaves = await Leave.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

// [PUT] Admin duyệt hoặc từ chối đơn
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'Đã duyệt' hoặc 'Từ chối'
    const leaveId = req.params.id;

    if (!["Đã duyệt", "Từ chối"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Trạng thái duyệt đơn không hợp lệ" });
    }

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn xin nghỉ phép" });
    }

    leave.status = status;
    leave.approvedBy = req.employee.employeeCode;
    await leave.save();

    res.status(200).json({
      success: true,
      message: `Đã cập nhật trạng thái đơn thành: ${status}`,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLeaveRequest,
  getLeaveRequests,
  updateLeaveStatus,
};
