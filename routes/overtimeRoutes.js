const express = require("express");
const router = express.Router();
const {
  createOvertime,
  getOvertimes,
  getOvertimeById,
  updateOvertimeStatus,
  deleteOvertime,
} = require("../controllers/overtimeController");

const { protect, authorize } = require("../middlewares/authMiddleware");

// Nhân viên đăng ký & xem đăng ký của mình
router.post("/", protect, createOvertime);
router.get("/", protect, getOvertimes);
router.get("/:id", protect, getOvertimeById);

// CHỈ ADMIN mới được duyệt đăng ký làm thêm
router.put("/:id/status", protect, authorize("Admin"), updateOvertimeStatus);

// Xóa (Admin hoặc chính nhân viên)
router.delete("/:id", protect, deleteOvertime);

module.exports = router;
