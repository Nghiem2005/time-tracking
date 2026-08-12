const express = require("express");
const router = express.Router();
const {
  createWorkplace,
  getWorkplaces,
  getWorkplaceById,
  updateWorkplace,
  deleteWorkplace,
} = require("../controllers/workplaceController");

// Import 2 "bác bảo vệ"
const { protect, authorize } = require("../middlewares/authMiddleware");

// Tất cả mọi người (đã đăng nhập) đều được xem danh sách nơi làm việc
router.get("/", protect, getWorkplaces);
router.get("/:id", protect, getWorkplaceById);

// CHỈ ADMIN mới được Thêm, Sửa, Xóa (Phải qua 2 chốt trạm)
router.post("/", protect, authorize("Admin"), createWorkplace);
router.put("/:id", protect, authorize("Admin"), updateWorkplace);
router.delete("/:id", protect, authorize("Admin"), deleteWorkplace);

module.exports = router;
