const express = require("express");
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

const { protect, authorize } = require("../middlewares/authMiddleware");

// Admin/Manager xem danh sách & chi tiết nhân viên
router.get("/", protect, authorize("Admin", "Manager"), getEmployees);
router.get("/:id", protect, authorize("Admin", "Manager"), getEmployeeById);

// CHỈ ADMIN mới được Thêm, Sửa, Xóa nhân viên
router.post("/", protect, authorize("Admin"), createEmployee);
router.put("/:id", protect, authorize("Admin"), updateEmployee);
router.delete("/:id", protect, authorize("Admin"), deleteEmployee);

module.exports = router;
