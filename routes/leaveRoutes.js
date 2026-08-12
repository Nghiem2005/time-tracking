const express = require("express");
const router = express.Router();
const {
  createLeaveRequest,
  getLeaveRequests,
  updateLeaveStatus,
} = require("../controllers/leaveController");

const { protect, authorize } = require("../middlewares/authMiddleware");

// Nhân viên tạo đơn & xem đơn của mình
router.post("/", protect, createLeaveRequest);
router.get("/", protect, getLeaveRequests);

// CHỈ ADMIN mới có quyền duyệt đơn
router.put("/:id/status", protect, authorize("Admin"), updateLeaveStatus);

module.exports = router;
