# Hệ thống API Chấm công theo vị trí (Location-based Attendance API)

Dự án xây dựng RESTful API phục vụ nghiệp vụ chấm công dựa trên tọa độ GPS, có tích hợp gọi API định vị bên ngoài để chuyển đổi địa chỉ thành tọa độ.

## Công nghệ sử dụng

- **Backend:** NodeJS, ExpressJS
- **Cơ sở dữ liệu:** MongoDB (Mongoose)
- **API Định vị:** OpenStreetMap Nominatim API

## Hướng dẫn cài đặt và khởi chạy

1. Tải mã nguồn về máy và mở bằng Visual Studio Code.
2. Mở Terminal và cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
   //thư viện bảo mật
   bcryptjs: Dùng để băm (mã hóa) mật khẩu. Tuyệt đối không bao giờ được lưu mật khẩu gốc (ví dụ: "123456") vào Database. Nếu DB bị hack, toàn bộ tài khoản sẽ lộ.

jsonwebtoken (JWT): Dùng để tạo ra một cái "thẻ thông hành" (Token). Sau khi user đăng nhập thành công, hệ thống sẽ cấp thẻ này. User cầm thẻ này để đi vào các API khác mà không cần đăng nhập lại.

// giao diện
cd client
npm install lucide-react
// Khởi động MongoDB
& "D:\Databases\MongoDB\bin\mongod.exe" --dbpath "D:\Databases\MongoDB\data\db"
// Khởi động Backend
cd "d:\app nodejs\time-tracking-api"
npm run dev
// Khởi động Frontend
cd "d:\app nodejs\time-tracking-api\client"
npm run dev