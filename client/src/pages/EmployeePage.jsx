import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import { useNavigate } from "react-router-dom";

export default function EmployeePage() {
  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState("attendance");
  const [leaves, setLeaves] = useState([]);
  const [overtimes, setOvertimes] = useState([]);
  const [workplaces, setWorkplaces] = useState([]);
  const [workplaceId, setWorkplaceId] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Form nghỉ phép
  const [leaveType, setLeaveType] = useState("Việc riêng");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  // Form làm thêm
  const [otDate, setOtDate] = useState("");
  const [otStart, setOtStart] = useState("");
  const [otEnd, setOtEnd] = useState("");
  const [otReason, setOtReason] = useState("");

  const navigate = useNavigate();

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const fetchLeaves = async () => {
    try {
      const res = await axiosClient.get("/leaves");
      setLeaves(res.data.data);
    } catch (err) {
      console.error("Lỗi tải danh sách nghỉ phép", err);
    }
  };

  const fetchOvertimes = async () => {
    try {
      const res = await axiosClient.get("/overtimes");
      setOvertimes(res.data.data);
    } catch (err) {
      console.error("Lỗi tải danh sách làm thêm", err);
    }
  };

  const fetchWorkplaces = async () => {
    try {
      const res = await axiosClient.get("/workplaces");
      setWorkplaces(res.data.data);
    } catch (err) {
      console.error("Lỗi tải danh sách chi nhánh", err);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const loadData = async () => {
      await fetchLeaves();
      await fetchOvertimes();
      await fetchWorkplaces();
    };
    loadData();
  }, [navigate, user]);

  // Hàm xử lý Check-in bằng GPS
  const handleCheckIn = () => {
    if (!workplaceId) {
      showMessage("Vui lòng chọn chi nhánh làm việc", "error");
      return;
    }
    if (!navigator.geolocation) {
      showMessage("Trình duyệt không hỗ trợ định vị GPS", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const res = await axiosClient.post("/checkins", {
            workplaceId,
            lat,
            lng,
          });
          showMessage(`Check-in thành công: ${res.data.message}`);
        } catch (err) {
          showMessage(
            err.response?.data?.message || "Check-in thất bại",
            "error",
          );
        }
      },
      (error) => {
        showMessage("Không lấy được vị trí GPS: " + error.message, "error");
      },
    );
  };

  // Hàm xử lý Check-out bằng GPS
  const handleCheckOut = () => {
    if (!navigator.geolocation) {
      showMessage("Trình duyệt không hỗ trợ định vị GPS", "error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const res = await axiosClient.put("/checkins/checkout", {
            lat,
            lng,
          });
          showMessage(`Check-out thành công: ${res.data.message}`);
        } catch (err) {
          showMessage(
            err.response?.data?.message || "Check-out thất bại",
            "error",
          );
        }
      },
      (error) => {
        showMessage("Không lấy được vị trí GPS: " + error.message, "error");
      },
    );
  };

  // Gửi đơn xin nghỉ phép
  const handleCreateLeave = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post("/leaves", {
        leaveType,
        startDate,
        endDate,
        reason,
      });
      showMessage("Gửi đơn nghỉ phép thành công!");
      setReason("");
      setStartDate("");
      setEndDate("");
      fetchLeaves();
    } catch (err) {
      showMessage(err.response?.data?.message || "Gửi đơn thất bại", "error");
    }
  };

  // Đăng ký làm thêm
  const handleCreateOvertime = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post("/overtimes", {
        date: otDate,
        startTime: otStart,
        endTime: otEnd,
        reason: otReason,
      });
      showMessage("Đăng ký làm thêm thành công!");
      setOtDate("");
      setOtStart("");
      setOtEnd("");
      setOtReason("");
      fetchOvertimes();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Đăng ký làm thêm thất bại",
        "error",
      );
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const statusBadge = (status) => {
    if (status === "Đã duyệt")
      return <span className="badge badge-green">{status}</span>;
    if (status === "Từ chối")
      return <span className="badge badge-red">{status}</span>;
    if (status === "Chờ duyệt")
      return <span className="badge badge-orange">{status}</span>;
    return <span className="badge badge-gray">{status}</span>;
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-icon">⏰</div>
            <span>Chấm Công GPS</span>
          </div>
          <div className="topbar-user">
            <div className="user-chip">
              <span>👤</span>
              <span>{user?.fullName || user?.employeeCode}</span>
            </div>
            <div className="avatar">
              {(user?.fullName || user?.employeeCode || "N")
                .charAt(0)
                .toUpperCase()}
            </div>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="container" style={{ marginTop: "20px" }}>
        <h2 style={{ marginBottom: "16px" }}>
          Xin chào, {user?.fullName || user?.employeeCode} 👋
        </h2>

        {message && (
          <div className={`alert alert-${messageType}`}>
            {messageType === "success" ? "✅" : "⚠️"} {message}
          </div>
        )}

        <div className="tabs">
          <button
            className={`tab ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => setActiveTab("attendance")}
          >
            📍 Chấm công
          </button>
          <button
            className={`tab ${activeTab === "leave" ? "active" : ""}`}
            onClick={() => setActiveTab("leave")}
          >
            📝 Nghỉ phép
          </button>
          <button
            className={`tab ${activeTab === "overtime" ? "active" : ""}`}
            onClick={() => setActiveTab("overtime")}
          >
            ⏱️ Làm thêm
          </button>
        </div>

        {/* ===== Tab Chấm Công ===== */}
        {activeTab === "attendance" && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span className="icon">📍</span> Chấm Công GPS
              </div>
            </div>
            <div className="form-group">
              <label>Chi nhánh làm việc</label>
              {workplaces.length === 0 ? (
                <div className="alert alert-info">
                  ℹ️ Chưa có chi nhánh nào. Vui lòng liên hệ Admin để tạo chi
                  nhánh trước khi chấm công.
                </div>
              ) : (
                <select
                  value={workplaceId}
                  onChange={(e) => setWorkplaceId(e.target.value)}
                >
                  <option value="">-- Chọn chi nhánh --</option>
                  {workplaces.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name} - {w.address}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                className="btn btn-success"
                onClick={handleCheckIn}
                disabled={!workplaceId}
              >
                ✅ Check-in
              </button>
              <button className="btn btn-warning" onClick={handleCheckOut}>
                🏁 Check-out
              </button>
            </div>
          </div>
        )}

        {/* ===== Tab Nghỉ Phép ===== */}
        {activeTab === "leave" && (
          <>
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <span className="icon">📝</span> Tạo Đơn Xin Nghỉ Phép
                </div>
              </div>
              <form onSubmit={handleCreateLeave}>
                <div className="form-group">
                  <label>Loại nghỉ</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                  >
                    <option value="Nghỉ phép năm">Nghỉ phép năm</option>
                    <option value="Nghỉ ốm">Nghỉ ốm</option>
                    <option value="Việc riêng">Việc riêng</option>
                    <option value="Không lương">Không lương</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Từ ngày</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Đến ngày</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Lý do</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    placeholder="Nhập lý do xin nghỉ..."
                    rows="3"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Gửi Đơn
                </button>
              </form>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <span className="icon">📋</span> Lịch sử đơn của tôi
                </div>
              </div>
              {leaves.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📭</div>
                  <p>Chưa có đơn nghỉ phép nào</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Loại</th>
                        <th>Thời gian</th>
                        <th>Lý do</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.map((item) => (
                        <tr key={item._id}>
                          <td>{item.leaveType}</td>
                          <td>
                            {item.startDate?.substring(0, 10)} →{" "}
                            {item.endDate?.substring(0, 10)}
                          </td>
                          <td>{item.reason}</td>
                          <td>{statusBadge(item.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ===== Tab Làm Thêm ===== */}
        {activeTab === "overtime" && (
          <>
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <span className="icon">⏱️</span> Đăng Ký Làm Thêm
                </div>
              </div>
              <form onSubmit={handleCreateOvertime}>
                <div className="form-group">
                  <label>Ngày làm thêm</label>
                  <input
                    type="date"
                    value={otDate}
                    onChange={(e) => setOtDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Giờ bắt đầu</label>
                    <input
                      type="time"
                      value={otStart}
                      onChange={(e) => setOtStart(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Giờ kết thúc</label>
                    <input
                      type="time"
                      value={otEnd}
                      onChange={(e) => setOtEnd(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Lý do</label>
                  <textarea
                    value={otReason}
                    onChange={(e) => setOtReason(e.target.value)}
                    placeholder="Nhập lý do làm thêm..."
                    rows="3"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Đăng Ký
                </button>
              </form>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <span className="icon">📋</span> Lịch sử làm thêm
                </div>
              </div>
              {overtimes.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📭</div>
                  <p>Chưa có đăng ký làm thêm nào</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th>Giờ</th>
                        <th>Số giờ</th>
                        <th>Lý do</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overtimes.map((item) => (
                        <tr key={item._id}>
                          <td>{item.date?.substring(0, 10)}</td>
                          <td>
                            {item.startTime} - {item.endTime}
                          </td>
                          <td>{item.hours} giờ</td>
                          <td>{item.reason || "-"}</td>
                          <td>{statusBadge(item.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
