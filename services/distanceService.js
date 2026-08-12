/**
 * Chuyển đổi từ độ (degrees) sang radian
 */
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Tính khoảng cách giữa 2 tọa độ (Lat, Lng) bằng mét
 */
const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Bán kính trung bình của Trái Đất tính bằng mét

  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Khoảng cách bằng mét
};

/**
 * Hàm nghiệp vụ: Kiểm tra xem khoảng cách có hợp lệ không
 * @param {Object} workplaceCoords - Tọa độ công ty { lat, lng }
 * @param {Object} employeeCoords - Tọa độ nhân viên { lat, lng }
 * @param {number} allowedRadius - Bán kính cho phép chấm công (mặc định 100m)
 */
const checkAttendanceRadius = (
  workplaceCoords,
  employeeCoords,
  allowedRadius = 100,
) => {
  const distance = getDistanceInMeters(
    workplaceCoords.lat,
    workplaceCoords.lng,
    employeeCoords.lat,
    employeeCoords.lng,
  );

  const roundedDistance = Math.round(distance);

  return {
    isValid: distance <= allowedRadius,
    distance: roundedDistance,
  };
};

module.exports = { checkAttendanceRadius };
