const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const requestLogger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");

// Bổ sung import 2 routes vừa tạo
const workplaceRoutes = require("./routes/workplaceRoutes");
const checkinRoutes = require("./routes/checkinRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const authRoutes = require("./routes/authRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const overtimeRoutes = require("./routes/overtimeRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use(requestLogger);

// Gắn routes vào ứng dụng
app.use("/api/workplaces", workplaceRoutes);
app.use("/api/checkins", checkinRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/overtimes", overtimeRoutes);
app.use("/api/statistics", statisticsRoutes);

// ===== Phục vụ Frontend (đã build) =====
// Nếu thư mục client/dist tồn tại (đã chạy `npm run build`), Express sẽ phục vụ
// file tĩnh của React và xử lý SPA routing (React Router).
const distPath = path.join(__dirname, "client", "dist");
if (fs.existsSync(distPath)) {
  // Phục vụ các file tĩnh (JS, CSS, ảnh...) trong client/dist
  app.use(express.static(distPath));

  // Mọi request không phải /api sẽ trả về index.html (để React Router xử lý).
  // Lưu ý: Express 5 không hỗ trợ wildcard '*' nên dùng middleware không có path.
  app.use((req, res, next) => {
    // Bỏ qua các request API
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use(errorHandler);

module.exports = app;
