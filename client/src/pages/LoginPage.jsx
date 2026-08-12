import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axiosClient.post("/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data));

        if (response.data.data.role === "Admin") {
          navigate("/admin");
        } else {
          navigate("/employee");
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Đăng nhập thất bại, vui lòng kiểm tra lại thông tin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">⏰</div>
        <h1 className="login-title">Chấm Công GPS</h1>
        <p className="login-subtitle">Đăng nhập để tiếp tục</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ví dụ: nv@company.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ marginTop: "8px", padding: "12px" }}
          >
            {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
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
          Chưa có tài khoản?{" "}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
