import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [form, setForm] = useState({
    employeeCode: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    department: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Nếu đã đăng nhập thì tự động chuyển hướng
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      navigate(user.role === "Admin" ? "/admin" : "/employee");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.post("/auth/register", {
        employeeCode: form.employeeCode,
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        department: form.department,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        alert("Đăng ký tài khoản thành công!");
        navigate("/employee");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Đăng ký thất bại, vui lòng kiểm tra lại thông tin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: "440px" }}>
        <div className="login-logo">📝</div>
        <h1 className="login-title">Đăng Ký Tài Khoản</h1>
        <p className="login-subtitle">Tạo tài khoản nhân viên mới</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-row">
            <div className="form-group">
              <label>Mã nhân viên</label>
              <input
                type="text"
                name="employeeCode"
                value={form.employeeCode}
                onChange={handleChange}
                placeholder="VD: NV001"
                required
              />
            </div>
            <div className="form-group">
              <label>Họ tên</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="VD: Nguyễn Văn A"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="VD: nv@company.com"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="VD: 0901234567"
              />
            </div>
            <div className="form-group">
              <label>Phòng ban</label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="VD: IT, HR..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ marginTop: "8px", padding: "12px" }}
          >
            {loading ? "Đang đăng ký..." : "Đăng Ký"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "16px",
            fontSize: "14px",
            color: "var(--text-muted)",
          }}
        >
          Đã có tài khoản?{" "}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
