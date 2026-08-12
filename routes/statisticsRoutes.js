const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getAttendanceStats,
  getOvertimeStats,
  getEmployeeReport,
} = require("../controllers/statisticsController");

const { protect, authorize } = require("../middlewares/authMiddleware");

// Dashboard tổng quan (Admin/Manager)
router.get("/dashboard", protect, authorize("Admin", "Manager"), getDashboard);

// Thống kê chấm công (Admin/Manager)
router.get(
  "/attendance",
  protect,
  authorize("Admin", "Manager"),
  getAttendanceStats,
);

// Thống kê làm thêm (Admin/Manager)
router.get(
  "/overtime",
  protect,
  authorize("Admin", "Manager"),
  getOvertimeStats,
);

// Báo cáo chi tiết 1 nhân viên (Admin/Manager hoặc chính NV)
router.get("/employee", protect, getEmployeeReport);

module.exports = router;
