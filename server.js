// Nạp biến môi trường từ file .env (phải gọi TRƯỚC khi dùng process.env)
require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app"); // Nhập cấu hình app từ file app.js

// Lấy cấu hình từ biến môi trường (file .env), có giá trị mặc định nếu thiếu
const PORT = process.env.PORT || 3000;
// Chuỗi kết nối tới MongoDB. CSDL tên là 'time_tracking_db' (nếu chưa có nó sẽ tự tạo)
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/time_tracking_db";

// Kết nối tới Database
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Kết nối MongoDB thành công!");

    // Chỉ khi kết nối DB thành công mới cho server chạy
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Lỗi kết nối MongoDB:", error);
    process.exit(1); // Dừng app nếu không kết nối được DB
  });
