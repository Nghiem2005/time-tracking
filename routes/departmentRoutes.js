const express = require("express");
const router = express.Router();
const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");

// Import Middleware
const { protect, authorize } = require("../middlewares/authMiddleware");

// Khai báo các API
// Ai đăng nhập rồi (protect) cũng xem được danh sách phòng ban
router.get("/", protect, getDepartments);
router.get("/:id", protect, getDepartmentById);

// CHỈ ADMIN (authorize('Admin')) mới được Thêm, Sửa, Xóa
router.post("/", protect, authorize("Admin"), createDepartment);
router.put("/:id", protect, authorize("Admin"), updateDepartment);
router.delete("/:id", protect, authorize("Admin"), deleteDepartment);

module.exports = router;
