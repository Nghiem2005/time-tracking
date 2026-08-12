const errorHandler = (err, req, res, next) => {
  // Nếu lỗi có kèm theo HTTP status code (vd: 400, 404) thì dùng, không thì mặc định là 500
  const statusCode = err.statusCode || 500;

  // In lỗi ra console để dev dễ dò
  console.error(`[ERROR] ${err.message}`);

  // Trả về JSON theo đúng chuẩn RESTful
  res.status(statusCode).json({
    success: false,
    message: err.message || "Lỗi máy chủ nội bộ",
    // Bạn có thể bỏ dòng stackTrace này khi đem báo cáo, nhưng khi đang dev thì nên để để biết lỗi ở dòng nào
    stackTrace: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;
