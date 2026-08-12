const Workplace = require("../models/Workplace");
const { getCoordinates } = require("../services/geocodingService");

// [POST] Thêm mới chi nhánh
const createWorkplace = async (req, res, next) => {
  try {
    const { name, address } = req.body;

    if (!name || !address) {
      const error = new Error("Vui lòng cung cấp tên và địa chỉ chi nhánh");
      error.statusCode = 400;
      throw error;
    }

    const coords = await getCoordinates(address);

    const newWorkplace = new Workplace({
      name,
      address,
      location: {
        lat: coords.lat,
        lng: coords.lng,
      },
    });

    await newWorkplace.save();

    res.status(201).json({
      success: true,
      message: "Tạo chi nhánh thành công",
      data: newWorkplace,
    });
  } catch (error) {
    next(error);
  }
};

// [GET] Lấy danh sách chi nhánh (Đây chính là hàm bị thiếu gây ra lỗi)
const getWorkplaces = async (req, res, next) => {
  try {
    const workplaces = await Workplace.find();
    res.status(200).json({
      success: true,
      data: workplaces,
    });
  } catch (error) {
    next(error);
  }
};

// [GET] Xem chi tiết 1 chi nhánh theo ID
const getWorkplaceById = async (req, res, next) => {
  try {
    const workplace = await Workplace.findById(req.params.id);
    if (!workplace)
      throw { statusCode: 404, message: "Không tìm thấy chi nhánh" };
    res.status(200).json({ success: true, data: workplace });
  } catch (error) {
    next(error);
  }
};

// [PUT] Cập nhật thông tin chi nhánh
const updateWorkplace = async (req, res, next) => {
  try {
    const updatedWorkplace = await Workplace.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!updatedWorkplace)
      throw {
        statusCode: 404,
        message: "Không tìm thấy chi nhánh để cập nhật",
      };
    res
      .status(200)
      .json({
        success: true,
        message: "Cập nhật thành công",
        data: updatedWorkplace,
      });
  } catch (error) {
    next(error);
  }
};

// [DELETE] Xóa chi nhánh
const deleteWorkplace = async (req, res, next) => {
  try {
    const deletedWorkplace = await Workplace.findByIdAndDelete(req.params.id);
    if (!deletedWorkplace)
      throw { statusCode: 404, message: "Không tìm thấy chi nhánh để xóa" };
    res.status(200).json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    next(error);
  }
};

// Xuất tất cả các hàm
module.exports = {
  createWorkplace,
  getWorkplaces,
  getWorkplaceById,
  updateWorkplace,
  deleteWorkplace,
};
