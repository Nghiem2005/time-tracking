const CheckIn = require("../models/CheckIn");
const Workplace = require("../models/Workplace");
const { checkAttendanceRadius } = require("../services/distanceService");

// [POST] Chấm công
const createCheckIn = async (req, res, next) => {
  try {
    const { workplaceId, lat, lng } = req.body;
    const employeeCode = req.employee.employeeCode;

    const workplace = await Workplace.findById(workplaceId);
    if (!workplace) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy chi nhánh" });
    }

    // Kiểm tra xem nhân viên đã có bản ghi check-in chưa tan ca (chưa có checkOutTime) chưa.
    // Nếu có thì không cho check-in lại để tránh tạo nhiều bản ghi đang hoạt động cùng lúc.
    // Dùng checkOutTime thay vì status vì một số bản ghi cũ có thể không có trường status.
    const activeRecord = await CheckIn.findOne({
      employeeCode,
      checkOutTime: { $exists: false },
    }).sort({ createdAt: -1 });

    if (activeRecord) {
      return res.status(400).json({
        success: false,
        message:
          "Bạn đã check-in rồi. Vui lòng check-out trước khi check-in lại!",
      });
    }

    const employeeCoords = { lat: parseFloat(lat), lng: parseFloat(lng) };
    const radiusCheck = checkAttendanceRadius(
      workplace.location,
      employeeCoords,
      100,
    );

    // Ở đây sử dụng đúng biến CheckIn đã khai báo ở dòng 1
    const newCheckIn = new CheckIn({
      employeeCode,
      workplaceId,
      checkInLocation: employeeCoords,
      distanceIn: radiusCheck.distance,
      status: radiusCheck.isValid ? "Đang làm việc" : "Bất thường",
    });

    await newCheckIn.save();

    res.status(201).json({
      success: true,
      message: "Chấm công thành công!",
      data: newCheckIn,
    });
  } catch (error) {
    next(error);
  }
};

// [PUT] Tan ca
const checkOut = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    const employeeCode = req.employee.employeeCode;

    // Tìm bản ghi check-in chưa tan ca (chưa có checkOutTime) gần nhất của nhân viên.
    // KHÔNG chỉ dựa vào trường status vì:
    //  - Một số bản ghi cũ có thể không có trường status (do được tạo trước khi schema
    //    có trường này), nên truy vấn theo status sẽ không tìm thấy chúng.
    //  - KHÔNG giới hạn theo ngày (createdAt) vì createdAt được MongoDB lưu theo UTC,
    //    còn new Date() tính theo giờ local của server nên dễ bị lệch múi giờ.
    const record = await CheckIn.findOne({
      employeeCode,
      checkOutTime: { $exists: false },
    }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bản ghi đang làm việc",
      });
    }

    const checkOutTime = new Date();
    const workHours =
      Math.round(((checkOutTime - record.createdAt) / (1000 * 60 * 60)) * 100) /
      100;

    record.checkOutTime = checkOutTime;
    record.checkOutLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
    record.workHours = workHours;
    record.status = "Đã tan ca";

    await record.save();
    res
      .status(200)
      .json({ success: true, message: "Check-out thành công!", data: record });
  } catch (error) {
    next(error);
  }
};

// [GET] Danh sách
const getCheckIns = async (req, res, next) => {
  try {
    const checkins = await CheckIn.find()
      .populate("workplaceId", "name address")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: checkins });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCheckIn, getCheckIns, checkOut };
