const express = require("express");
const router = express.Router();

// Nhập middleware bảo vệ
const { protect } = require("../middlewares/authMiddleware");

// Gộp chung vào 1 dòng import duy nhất
const {
  createCheckIn,
  getCheckIns,
  checkOut,
} = require("../controllers/checkinController");

// Gắn protect vào trước các hàm xử lý
router.post("/", protect, createCheckIn);
router.get("/", protect, getCheckIns);
router.put("/checkout", protect, checkOut);

module.exports = router;
