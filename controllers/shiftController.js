const Shift = require("../models/Shift");

// [POST] Thêm ca làm mới (Chỉ Admin)
const createShift = async (req, res, next) => {
  try {
    const { shiftCode, shiftName, startTime, endTime, breakTime, status } =
      req.body;

    const shiftExists = await Shift.findOne({ shiftCode });
    if (shiftExists) {
      return res
        .status(400)
        .json({ success: false, message: "Mã ca làm đã tồn tại" });
    }

    const newShift = await Shift.create({
      shiftCode,
      shiftName,
      startTime,
      endTime,
      breakTime,
      status,
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Tạo ca làm thành công",
        data: newShift,
      });
  } catch (error) {
    next(error);
  }
};

// [GET] Lấy danh sách tất cả ca làm
const getShifts = async (req, res, next) => {
  try {
    const shifts = await Shift.find();
    res.status(200).json({ success: true, data: shifts });
  } catch (error) {
    next(error);
  }
};

// [GET] Lấy chi tiết 1 ca làm
const getShiftById = async (req, res, next) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy ca làm" });
    res.status(200).json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};

// [PUT] Cập nhật ca làm (Chỉ Admin)
const updateShift = async (req, res, next) => {
  try {
    const updatedShift = await Shift.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!updatedShift)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy ca làm" });
    res
      .status(200)
      .json({
        success: true,
        message: "Cập nhật thành công",
        data: updatedShift,
      });
  } catch (error) {
    next(error);
  }
};

// [DELETE] Xóa ca làm (Chỉ Admin)
const deleteShift = async (req, res, next) => {
  try {
    const deletedShift = await Shift.findByIdAndDelete(req.params.id);
    if (!deletedShift)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy ca làm" });
    res.status(200).json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createShift,
  getShifts,
  getShiftById,
  updateShift,
  deleteShift,
};
