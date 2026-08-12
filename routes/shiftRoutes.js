const express = require("express");
const router = express.Router();
const {
  createShift,
  getShifts,
  getShiftById,
  updateShift,
  deleteShift,
} = require("../controllers/shiftController");

// Import Middleware bảo vệ và phân quyền
const { protect, authorize } = require("../middlewares/authMiddleware");

// Nhân viên và Admin đều có thể xem danh sách ca làm
router.get("/", protect, getShifts);
router.get("/:id", protect, getShiftById);

// CHỈ ADMIN mới được quyền Thêm, Sửa, Xóa ca làm
router.post("/", protect, authorize("Admin"), createShift);
router.put("/:id", protect, authorize("Admin"), updateShift);
router.delete("/:id", protect, authorize("Admin"), deleteShift);

module.exports = router;
