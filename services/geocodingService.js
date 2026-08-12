const axios = require("axios");

const getCoordinates = async (address) => {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

    // Đã thêm Header User-Agent tại đây
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "TimeTrackingApp_Student_Project/1.0",
      },
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon),
      };
    }

    throw new Error(
      "Không thể tìm thấy tọa độ cho địa chỉ này, vui lòng thử địa chỉ chung chung hơn.",
    );
  } catch (error) {
    console.error("Lỗi khi gọi API Geocoding:", error.message);
    throw error;
  }
};

module.exports = { getCoordinates };
