const requestLogger = (req, res, next) => {
  const currentTime = new Date().toISOString();
  console.log(`[${currentTime}] ${req.method} request tới: ${req.url}`);

  // Gọi next() để request được đi tiếp đến các phần xử lý tiếp theo
  next();
};

module.exports = requestLogger;
