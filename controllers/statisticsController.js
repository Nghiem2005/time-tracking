const CheckIn = require("../models/CheckIn");
const Overtime = require("../models/Overtime");
const Employee = require("../models/Employee");

// Hàm hỗ trợ: lấy khoảng thời gian theo ngày/tháng
const getDateRange = (year, month, day) => {
  const start = new Date(year, month - 1, day || 1);
  const end = new Date(year, month - 1, (day || 1) + 1);
  if (!day) {
    // Theo tháng: từ ngày 1 đến hết tháng
    start.setDate(1);
    end.setMonth(month); // đầu tháng sau
    end.setDate(1);
  }
  return { start, end };
};

// [GET] Tổng quan dashboard (Admin/Manager)
const getDashboard = async (req, res, next) => {
  try {
    const totalEmployees = await Employee.countDocuments({ status: "Active" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCheckins = await CheckIn.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    });
    const todayOvertime = await Overtime.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: "Đã duyệt",
    });

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        todayCheckins,
        todayOvertime,
      },
    });
  } catch (error) {
    next(error);
  }
};

// [GET] Thống kê chấm công theo ngày/tháng (Admin/Manager)
// Query: ?year=2026&month=8&day=11&employeeCode=NV001
const getAttendanceStats = async (req, res, next) => {
  try {
    const { year, month, day, employeeCode } = req.query;
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;
    const d = day ? parseInt(day) : null;

    const { start, end } = getDateRange(y, m, d);

    let query = { createdAt: { $gte: start, $lt: end } };
    if (employeeCode) query.employeeCode = employeeCode;

    const checkins = await CheckIn.find(query).populate(
      "workplaceId",
      "name address",
    );

    // Tổng hợp theo nhân viên
    const byEmployee = {};
    checkins.forEach((c) => {
      if (!byEmployee[c.employeeCode]) {
        byEmployee[c.employeeCode] = {
          employeeCode: c.employeeCode,
          totalDays: 0,
          totalHours: 0,
          onTime: 0,
          abnormal: 0,
        };
      }
      byEmployee[c.employeeCode].totalDays += 1;
      byEmployee[c.employeeCode].totalHours += c.workHours || 0;
      if (c.status === "Bất thường") byEmployee[c.employeeCode].abnormal += 1;
      else byEmployee[c.employeeCode].onTime += 1;
    });

    res.status(200).json({
      success: true,
      data: {
        period: { year: y, month: m, day: d },
        totalRecords: checkins.length,
        byEmployee: Object.values(byEmployee),
      },
    });
  } catch (error) {
    next(error);
  }
};

// [GET] Thống kê làm thêm theo ngày/tháng (Admin/Manager)
// Query: ?year=2026&month=8&day=11&employeeCode=NV001
const getOvertimeStats = async (req, res, next) => {
  try {
    const { year, month, day, employeeCode } = req.query;
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;
    const d = day ? parseInt(day) : null;

    const { start, end } = getDateRange(y, m, d);

    let query = { date: { $gte: start, $lt: end } };
    if (employeeCode) query.employeeCode = employeeCode;

    const overtimes = await Overtime.find(query);

    const byEmployee = {};
    overtimes.forEach((o) => {
      if (!byEmployee[o.employeeCode]) {
        byEmployee[o.employeeCode] = {
          employeeCode: o.employeeCode,
          totalRequests: 0,
          approvedHours: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        };
      }
      byEmployee[o.employeeCode].totalRequests += 1;
      if (o.status === "Đã duyệt") {
        byEmployee[o.employeeCode].approved += 1;
        byEmployee[o.employeeCode].approvedHours += o.hours || 0;
      } else if (o.status === "Từ chối") {
        byEmployee[o.employeeCode].rejected += 1;
      } else {
        byEmployee[o.employeeCode].pending += 1;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        period: { year: y, month: m, day: d },
        totalRecords: overtimes.length,
        byEmployee: Object.values(byEmployee),
      },
    });
  } catch (error) {
    next(error);
  }
};

// [GET] Báo cáo chi tiết chấm công của 1 nhân viên (Admin/Manager hoặc chính NV)
// Query: ?employeeCode=NV001&year=2026&month=8
const getEmployeeReport = async (req, res, next) => {
  try {
    const { employeeCode, year, month } = req.query;
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;

    // Nếu là Employee, chỉ xem được báo cáo của chính mình
    const targetCode = employeeCode || req.employee.employeeCode;
    if (
      req.employee.role === "Employee" &&
      targetCode !== req.employee.employeeCode
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể xem báo cáo của chính mình",
      });
    }

    const { start, end } = getDateRange(y, m);

    const checkins = await CheckIn.find({
      employeeCode: targetCode,
      createdAt: { $gte: start, $lt: end },
    }).populate("workplaceId", "name address");

    const overtimes = await Overtime.find({
      employeeCode: targetCode,
      date: { $gte: start, $lt: end },
    });

    const totalDays = checkins.length;
    const totalHours = checkins.reduce((s, c) => s + (c.workHours || 0), 0);
    const abnormalDays = checkins.filter(
      (c) => c.status === "Bất thường",
    ).length;
    const approvedOvertimeHours = overtimes
      .filter((o) => o.status === "Đã duyệt")
      .reduce((s, o) => s + (o.hours || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        employeeCode: targetCode,
        period: { year: y, month: m },
        summary: {
          totalDays,
          totalHours: Math.round(totalHours * 100) / 100,
          abnormalDays,
          approvedOvertimeHours,
        },
        checkins,
        overtimes,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getAttendanceStats,
  getOvertimeStats,
  getEmployeeReport,
};
