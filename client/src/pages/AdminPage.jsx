import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const [adminUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [leaves, setLeaves] = useState([]);
  const [overtimes, setOvertimes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [workplaces, setWorkplaces] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Thống kê
  const [statsMonth, setStatsMonth] = useState(new Date().getMonth() + 1);
  const [statsYear, setStatsYear] = useState(new Date().getFullYear());
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [overtimeStats, setOvertimeStats] = useState(null);

  // Form thêm nhân viên
  const [empForm, setEmpForm] = useState({
    employeeCode: "",
    fullName: "",
    email: "",
    password: "",
    role: "Employee",
    phone: "",
    department: "",
  });

  // Form thêm chi nhánh
  const [wpForm, setWpForm] = useState({ name: "", address: "" });

  // Form thêm phòng ban
  const [deptForm, setDeptForm] = useState({
    departmentCode: "",
    name: "",
    description: "",
  });

  // Form thêm ca làm
  const [shiftForm, setShiftForm] = useState({
    shiftCode: "",
    shiftName: "",
    startTime: "",
    endTime: "",
    breakTime: 0,
  });

  // Đối tượng đang chỉnh sửa (null = không sửa)
  const [editingEmp, setEditingEmp] = useState(null);
  const [editingWp, setEditingWp] = useState(null);
  const [editingDept, setEditingDept] = useState(null);
  const [editingShift, setEditingShift] = useState(null);

  const navigate = useNavigate();

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const fetchAllLeaves = async () => {
    try {
      const res = await axiosClient.get("/leaves");
      setLeaves(res.data.data);
    } catch (err) {
      console.error("Lỗi tải danh sách đơn", err);
    }
  };

  const fetchAllOvertimes = async () => {
    try {
      const res = await axiosClient.get("/overtimes");
      setOvertimes(res.data.data);
    } catch (err) {
      console.error("Lỗi tải danh sách làm thêm", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axiosClient.get("/employees");
      setEmployees(res.data.data);
    } catch (err) {
      console.error("Lỗi tải danh sách nhân viên", err);
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

  const fetchDepartments = async () => {
    try {
      const res = await axiosClient.get("/departments");
      setDepartments(res.data.data);
    } catch (err) {
      console.error("Lỗi tải danh sách phòng ban", err);
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await axiosClient.get("/shifts");
      setShifts(res.data.data);
    } catch (err) {
      console.error("Lỗi tải danh sách ca làm", err);
    }
  };

  const fetchCheckins = async () => {
    try {
      const res = await axiosClient.get("/checkins");
      setCheckins(res.data.data);
    } catch (err) {
      console.error("Lỗi tải danh sách chấm công", err);
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await axiosClient.get("/statistics/dashboard");
      setDashboard(res.data.data);
    } catch (err) {
      console.error("Lỗi tải dashboard", err);
    }
  };

  const fetchStats = async () => {
    try {
      const [attRes, otRes] = await Promise.all([
        axiosClient.get(
          `/statistics/attendance?year=${statsYear}&month=${statsMonth}`,
        ),
        axiosClient.get(
          `/statistics/overtime?year=${statsYear}&month=${statsMonth}`,
        ),
      ]);
      setAttendanceStats(attRes.data.data);
      setOvertimeStats(otRes.data.data);
    } catch (err) {
      console.error("Lỗi tải thống kê", err);
    }
  };

  useEffect(() => {
    if (!adminUser) {
      navigate("/login");
      return;
    }
    if (adminUser.role !== "Admin") {
      alert("Bạn không có quyền truy cập trang Admin!");
      navigate("/employee");
      return;
    }
    const loadData = async () => {
      await fetchAllLeaves();
      await fetchAllOvertimes();
      await fetchEmployees();
      await fetchWorkplaces();
      await fetchDepartments();
      await fetchShifts();
      await fetchCheckins();
      await fetchDashboard();
    };
    loadData();
  }, [navigate, adminUser]);

  // ===== Nhân viên =====
  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post("/employees", empForm);
      showMessage("Thêm nhân viên thành công!");
      setEmpForm({
        employeeCode: "",
        fullName: "",
        email: "",
        password: "",
        role: "Employee",
        phone: "",
        department: "",
      });
      fetchEmployees();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Thêm nhân viên thất bại",
        "error",
      );
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhân viên này?")) return;
    try {
      await axiosClient.delete(`/employees/${id}`);
      showMessage("Xóa nhân viên thành công!");
      fetchEmployees();
    } catch (err) {
      showMessage(err.response?.data?.message || "Xóa thất bại", "error");
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      const { password, ...rest } = editingEmp;
      const payload = { ...rest };
      if (password) payload.password = password;
      await axiosClient.put(`/employees/${editingEmp._id}`, payload);
      showMessage("Cập nhật nhân viên thành công!");
      setEditingEmp(null);
      fetchEmployees();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Cập nhật nhân viên thất bại",
        "error",
      );
    }
  };

  // ===== Chi nhánh =====
  const handleCreateWorkplace = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post("/workplaces", wpForm);
      showMessage("Thêm chi nhánh thành công!");
      setWpForm({ name: "", address: "" });
      fetchWorkplaces();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Thêm chi nhánh thất bại",
        "error",
      );
    }
  };

  const handleDeleteWorkplace = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa chi nhánh này?")) return;
    try {
      await axiosClient.delete(`/workplaces/${id}`);
      showMessage("Xóa chi nhánh thành công!");
      fetchWorkplaces();
    } catch (err) {
      showMessage(err.response?.data?.message || "Xóa thất bại", "error");
    }
  };

  const handleUpdateWorkplace = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put(`/workplaces/${editingWp._id}`, {
        name: editingWp.name,
        address: editingWp.address,
      });
      showMessage("Cập nhật chi nhánh thành công!");
      setEditingWp(null);
      fetchWorkplaces();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Cập nhật chi nhánh thất bại",
        "error",
      );
    }
  };

  // ===== Phòng ban =====
  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post("/departments", deptForm);
      showMessage("Thêm phòng ban thành công!");
      setDeptForm({ departmentCode: "", name: "", description: "" });
      fetchDepartments();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Thêm phòng ban thất bại",
        "error",
      );
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phòng ban này?")) return;
    try {
      await axiosClient.delete(`/departments/${id}`);
      showMessage("Xóa phòng ban thành công!");
      fetchDepartments();
    } catch (err) {
      showMessage(err.response?.data?.message || "Xóa thất bại", "error");
    }
  };

  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put(`/departments/${editingDept._id}`, {
        departmentCode: editingDept.departmentCode,
        name: editingDept.name,
        description: editingDept.description,
      });
      showMessage("Cập nhật phòng ban thành công!");
      setEditingDept(null);
      fetchDepartments();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Cập nhật phòng ban thất bại",
        "error",
      );
    }
  };

  // ===== Ca làm =====
  const handleCreateShift = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post("/shifts", shiftForm);
      showMessage("Thêm ca làm thành công!");
      setShiftForm({
        shiftCode: "",
        shiftName: "",
        startTime: "",
        endTime: "",
        breakTime: 0,
      });
      fetchShifts();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Thêm ca làm thất bại",
        "error",
      );
    }
  };

  const handleDeleteShift = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa ca làm này?")) return;
    try {
      await axiosClient.delete(`/shifts/${id}`);
      showMessage("Xóa ca làm thành công!");
      fetchShifts();
    } catch (err) {
      showMessage(err.response?.data?.message || "Xóa thất bại", "error");
    }
  };

  const handleUpdateShift = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put(`/shifts/${editingShift._id}`, {
        shiftCode: editingShift.shiftCode,
        shiftName: editingShift.shiftName,
        startTime: editingShift.startTime,
        endTime: editingShift.endTime,
        breakTime: editingShift.breakTime,
      });
      showMessage("Cập nhật ca làm thành công!");
      setEditingShift(null);
      fetchShifts();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Cập nhật ca làm thất bại",
        "error",
      );
    }
  };

  // ===== Nghỉ phép & Làm thêm =====
  const handleUpdateLeaveStatus = async (id, status) => {
    try {
      await axiosClient.put(`/leaves/${id}/status`, { status });
      showMessage(`Đã cập nhật đơn thành: ${status}`);
      fetchAllLeaves();
    } catch (err) {
      showMessage(err.response?.data?.message || "Cập nhật thất bại", "error");
    }
  };

  const handleUpdateOvertimeStatus = async (id, status) => {
    try {
      await axiosClient.put(`/overtimes/${id}/status`, { status });
      showMessage(`Đã cập nhật làm thêm thành: ${status}`);
      fetchAllOvertimes();
    } catch (err) {
      showMessage(err.response?.data?.message || "Cập nhật thất bại", "error");
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
    if (status === "Active")
      return <span className="badge badge-green">{status}</span>;
    if (status === "Inactive")
      return <span className="badge badge-gray">{status}</span>;
    if (status === "Đang làm việc")
      return <span className="badge badge-blue">{status}</span>;
    if (status === "Đã tan ca")
      return <span className="badge badge-green">{status}</span>;
    if (status === "Bất thường")
      return <span className="badge badge-red">{status}</span>;
    return <span className="badge badge-gray">{status}</span>;
  };

  const roleBadge = (role) => {
    if (role === "Admin")
      return <span className="badge badge-red">{role}</span>;
    if (role === "Manager")
      return <span className="badge badge-blue">{role}</span>;
    return <span className="badge badge-gray">{role}</span>;
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-icon">⏰</div>
            <span>Quản Trị Hệ Thống</span>
          </div>
          <div className="topbar-user">
            <div className="user-chip">
              <span>👤</span>
              <span>{adminUser?.fullName || adminUser?.employeeCode}</span>
            </div>
            <div className="avatar">
              {(adminUser?.fullName || adminUser?.employeeCode || "A")
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
        <h2 style={{ marginBottom: "16px" }}>Trang Quản Trị 🛠️</h2>

        {message && (
          <div className={`alert alert-${messageType}`}>
            {messageType === "success" ? "✅" : "⚠️"} {message}
          </div>
        )}

        <div className="tabs">
          <button
            className={`tab ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            📊 Dashboard
          </button>
          <button
            className={`tab ${activeTab === "employees" ? "active" : ""}`}
            onClick={() => setActiveTab("employees")}
          >
            👥 Nhân viên
          </button>
          <button
            className={`tab ${activeTab === "workplaces" ? "active" : ""}`}
            onClick={() => setActiveTab("workplaces")}
          >
            🏢 Chi nhánh
          </button>
          <button
            className={`tab ${activeTab === "departments" ? "active" : ""}`}
            onClick={() => setActiveTab("departments")}
          >
            🏛️ Phòng ban
          </button>
          <button
            className={`tab ${activeTab === "shifts" ? "active" : ""}`}
            onClick={() => setActiveTab("shifts")}
          >
            ⏰ Ca làm
          </button>
          <button
            className={`tab ${activeTab === "checkins" ? "active" : ""}`}
            onClick={() => setActiveTab("checkins")}
          >
            📍 Chấm công
          </button>
          <button
            className={`tab ${activeTab === "leaves" ? "active" : ""}`}
            onClick={() => setActiveTab("leaves")}
          >
            📝 Nghỉ phép
          </button>
          <button
            className={`tab ${activeTab === "overtimes" ? "active" : ""}`}
            onClick={() => setActiveTab("overtimes")}
          >
            ⏱️ Làm thêm
          </button>
          <button
            className={`tab ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("stats");
              fetchStats();
            }}
          >
            📈 Thống kê
          </button>
        </div>

        {/* ===== Tab Dashboard ===== */}
        {activeTab === "dashboard" && (
          <div className="grid grid-4">
            <div className="stat-card">
              <div className="stat-icon purple">👥</div>
              <div>
                <div className="stat-value">
                  {dashboard?.totalEmployees ?? 0}
                </div>
                <div className="stat-label">Nhân viên đang hoạt động</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">📍</div>
              <div>
                <div className="stat-value">
                  {dashboard?.todayCheckins ?? 0}
                </div>
                <div className="stat-label">Chấm công hôm nay</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">⏱️</div>
              <div>
                <div className="stat-value">
                  {dashboard?.todayOvertime ?? 0}
                </div>
                <div className="stat-label">Làm thêm hôm nay</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue">📝</div>
              <div>
                <div className="stat-value">{leaves.length}</div>
                <div className="stat-label">Tổng đơn nghỉ phép</div>
              </div>
            </div>
          </div>
        )}

        {/* ===== Tab Nhân Viên ===== */}
        {activeTab === "employees" && (
          <>
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <span className="icon">➕</span> Thêm Nhân Viên Mới
                </div>
              </div>
              <form onSubmit={handleCreateEmployee}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Mã nhân viên</label>
                    <input
                      type="text"
                      value={empForm.employeeCode}
                      onChange={(e) =>
                        setEmpForm({ ...empForm, employeeCode: e.target.value })
                      }
                      placeholder="VD: NV001"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Họ tên</label>
                    <input
                      type="text"
                      value={empForm.fullName}
                      onChange={(e) =>
                        setEmpForm({ ...empForm, fullName: e.target.value })
                      }
                      placeholder="VD: Nguyễn Văn A"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={empForm.email}
                      onChange={(e) =>
                        setEmpForm({ ...empForm, email: e.target.value })
                      }
                      placeholder="VD: nv@company.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mật khẩu</label>
                    <input
                      type="password"
                      value={empForm.password}
                      onChange={(e) =>
                        setEmpForm({ ...empForm, password: e.target.value })
                      }
                      placeholder="Mật khẩu mặc định"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Vai trò</label>
                    <select
                      value={empForm.role}
                      onChange={(e) =>
                        setEmpForm({ ...empForm, role: e.target.value })
                      }
                    >
                      <option value="Employee">Nhân viên</option>
                      <option value="Manager">Quản lý</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Phòng ban</label>
                    <input
                      type="text"
                      value={empForm.department}
                      onChange={(e) =>
                        setEmpForm({ ...empForm, department: e.target.value })
                      }
                      placeholder="VD: IT, HR..."
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    value={empForm.phone}
                    onChange={(e) =>
                      setEmpForm({ ...empForm, phone: e.target.value })
                    }
                    placeholder="VD: 0901234567"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Thêm Nhân Viên
                </button>
              </form>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <span className="icon">👥</span> Danh Sách Nhân Viên
                </div>
              </div>
              {employees.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📭</div>
                  <p>Chưa có nhân viên nào</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Mã NV</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Phòng ban</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr key={emp._id}>
                          <td>
                            <strong>{emp.employeeCode}</strong>
                          </td>
                          <td>{emp.fullName}</td>
                          <td>{emp.email}</td>
                          <td>{roleBadge(emp.role)}</td>
                          <td>{emp.department || "-"}</td>
                          <td>{statusBadge(emp.status)}</td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setEditingEmp({ ...emp })}
                              >
                                Sửa
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteEmployee(emp._id)}
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ===== Tab Chi Nhánh ===== */}
        {activeTab === "workplaces" && (
          <>
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <span className="icon">➕</span> Thêm Chi Nhánh Mới
                </div>
              </div>
              <form onSubmit={handleCreateWorkplace}>
                <div className="form-group">
                  <label>Tên chi nhánh</label>
                  <input
                    type="text"
                    value={wpForm.name}
                    onChange={(e) =>
                      setWpForm({ ...wpForm, name: e.target.value })
                    }
                    placeholder="VD: Công ty ABC - Trụ sở chính"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    value={wpForm.address}
                    onChange={(e) =>
                      setWpForm({ ...wpForm, address: e.target.value })
                    }
                    placeholder="VD: 123 Nguyễn Trãi, Thanh Xuân, Hà Nội"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Thêm Chi Nhánh
                </button>
              </form>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <span className="icon">🏢</span> Danh Sách Chi Nhánh
                </div>
              </div>
              {workplaces.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📭</div>
                  <p>Chưa có chi nhánh nào</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Tên</th>
                        <th>Địa chỉ</th>
                        <th>Tọa độ</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workplaces.map((w) => (
                        <tr key={w._id}>
                          <td>
                            <strong>{w.name}</strong>
                          </td>
                          <td>{w.address}</td>
                          <td>
                            {w.location?.lat?.toFixed(4)},{" "}
                            {w.location?.lng?.toFixed(4)}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setEditingWp({ ...w })}
                              >
                                Sửa
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteWorkplace(w._id)}
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ===== Tab Phòng Ban ===== */}
        {activeTab === "departments" && (
          <>
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <span className="icon">➕</span> Thêm Phòng Ban Mới
                </div>
              </div>
              <form onSubmit={handleCreateDepartment}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Mã phòng ban</label>
                    <input
                      type="text"
                      value={deptForm.departmentCode}
                      onChange={(e) =>
                        setDeptForm({
                          ...deptForm,
                          departmentCode: e.target.value,
                        })
                      }
                      placeholder="VD: IT, HR, MKT"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên phòng ban</label>
                    <input
                      type="text"
                      value={deptForm.name}
                      onChange={(e) =>
                        setDeptForm({ ...deptForm, name: e.target.value })
                      }
                      placeholder="VD: Phòng Công nghệ"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    value={deptForm.description}
                    onChange={(e) =>
                      setDeptForm({ ...deptForm, description: e.target.value })
                    }
                    placeholder="Mô tả phòng ban..."
                    rows="2"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Thêm Phòng Ban
                </button>
              </form>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <span className="icon">🏛️</span> Danh Sách Phòng Ban
                </div>
              </div>
              {departments.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📭</div>
                  <p>Chưa có phòng ban nào</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Mã</th>
                        <th>Tên</th>
                        <th>Mô tả</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((d) => (
                        <tr key={d._id}>
                          <td>
                            <strong>{d.departmentCode}</strong>
                          </td>
                          <td>{d.name}</td>
                          <td>{d.description || "-"}</td>
                          <td>{statusBadge(d.status)}</td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setEditingDept({ ...d })}
                              >
                                Sửa
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteDepartment(d._id)}
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ===== Tab Ca Làm ===== */}
        {activeTab === "shifts" && (
          <>
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <span className="icon">➕</span> Thêm Ca Làm Mới
                </div>
              </div>
              <form onSubmit={handleCreateShift}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Mã ca</label>
                    <input
                      type="text"
                      value={shiftForm.shiftCode}
                      onChange={(e) =>
                        setShiftForm({
                          ...shiftForm,
                          shiftCode: e.target.value,
                        })
                      }
                      placeholder="VD: CA_SANG"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên ca</label>
                    <input
                      type="text"
                      value={shiftForm.shiftName}
                      onChange={(e) =>
                        setShiftForm({
                          ...shiftForm,
                          shiftName: e.target.value,
                        })
                      }
                      placeholder="VD: Ca Sáng"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Giờ bắt đầu</label>
                    <input
                      type="time"
                      value={shiftForm.startTime}
                      onChange={(e) =>
                        setShiftForm({
                          ...shiftForm,
                          startTime: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Giờ kết thúc</label>
                    <input
                      type="time"
                      value={shiftForm.endTime}
                      onChange={(e) =>
                        setShiftForm({ ...shiftForm, endTime: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Thời gian nghỉ (phút)</label>
                  <input
                    type="number"
                    value={shiftForm.breakTime}
                    onChange={(e) =>
                      setShiftForm({
                        ...shiftForm,
                        breakTime: Number(e.target.value),
                      })
                    }
                    placeholder="VD: 30"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Thêm Ca Làm
                </button>
              </form>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <span className="icon">⏰</span> Danh Sách Ca Làm
                </div>
              </div>
              {shifts.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📭</div>
                  <p>Chưa có ca làm nào</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Mã</th>
                        <th>Tên</th>
                        <th>Giờ</th>
                        <th>Nghỉ</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.map((s) => (
                        <tr key={s._id}>
                          <td>
                            <strong>{s.shiftCode}</strong>
                          </td>
                          <td>{s.shiftName}</td>
                          <td>
                            {s.startTime} - {s.endTime}
                          </td>
                          <td>{s.breakTime} phút</td>
                          <td>{statusBadge(s.status)}</td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setEditingShift({ ...s })}
                              >
                                Sửa
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteShift(s._id)}
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ===== Tab Chấm Công ===== */}
        {activeTab === "checkins" && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span className="icon">📍</span> Danh Sách Chấm Công
              </div>
            </div>
            {checkins.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📭</div>
                <p>Chưa có bản ghi chấm công nào</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Mã NV</th>
                      <th>Chi nhánh</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Số giờ</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkins.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <strong>{c.employeeCode}</strong>
                        </td>
                        <td>{c.workplaceId?.name || "-"}</td>
                        <td>{new Date(c.createdAt).toLocaleString("vi-VN")}</td>
                        <td>
                          {c.checkOutTime
                            ? new Date(c.checkOutTime).toLocaleString("vi-VN")
                            : "-"}
                        </td>
                        <td>{c.workHours || 0} giờ</td>
                        <td>{statusBadge(c.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== Tab Nghỉ Phép ===== */}
        {activeTab === "leaves" && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span className="icon">📝</span> Danh Sách Đơn Xin Nghỉ Phép
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
                      <th>Mã NV</th>
                      <th>Loại đơn</th>
                      <th>Thời gian</th>
                      <th>Lý do</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <strong>{item.employeeCode}</strong>
                        </td>
                        <td>{item.leaveType}</td>
                        <td>
                          {item.startDate?.substring(0, 10)} →{" "}
                          {item.endDate?.substring(0, 10)}
                        </td>
                        <td>{item.reason}</td>
                        <td>{statusBadge(item.status)}</td>
                        <td>
                          {item.status === "Chờ duyệt" && (
                            <div
                              style={{
                                display: "flex",
                                gap: "6px",
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() =>
                                  handleUpdateLeaveStatus(item._id, "Đã duyệt")
                                }
                              >
                                Duyệt
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() =>
                                  handleUpdateLeaveStatus(item._id, "Từ chối")
                                }
                              >
                                Từ chối
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== Tab Làm Thêm ===== */}
        {activeTab === "overtimes" && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span className="icon">⏱️</span> Danh Sách Đăng Ký Làm Thêm
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
                      <th>Mã NV</th>
                      <th>Ngày</th>
                      <th>Giờ</th>
                      <th>Số giờ</th>
                      <th>Lý do</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overtimes.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <strong>{item.employeeCode}</strong>
                        </td>
                        <td>{item.date?.substring(0, 10)}</td>
                        <td>
                          {item.startTime} - {item.endTime}
                        </td>
                        <td>{item.hours} giờ</td>
                        <td>{item.reason || "-"}</td>
                        <td>{statusBadge(item.status)}</td>
                        <td>
                          {item.status === "Chờ duyệt" && (
                            <div
                              style={{
                                display: "flex",
                                gap: "6px",
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() =>
                                  handleUpdateOvertimeStatus(
                                    item._id,
                                    "Đã duyệt",
                                  )
                                }
                              >
                                Duyệt
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() =>
                                  handleUpdateOvertimeStatus(
                                    item._id,
                                    "Từ chối",
                                  )
                                }
                              >
                                Từ chối
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== Tab Thống Kê ===== */}
        {activeTab === "stats" && (
          <>
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <span className="icon">📈</span> Thống Kê Chấm Công & Làm Thêm
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <select
                    value={statsMonth}
                    onChange={(e) => setStatsMonth(Number(e.target.value))}
                    style={{ width: "auto" }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        Tháng {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={statsYear}
                    onChange={(e) => setStatsYear(Number(e.target.value))}
                    style={{ width: "auto" }}
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={fetchStats}
                  >
                    Xem
                  </button>
                </div>
              </div>

              <div className="grid grid-2">
                <div>
                  <h4 style={{ marginBottom: "10px" }}>📍 Chấm công</h4>
                  {attendanceStats?.byEmployee?.length ? (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Mã NV</th>
                            <th>Số ngày</th>
                            <th>Tổng giờ</th>
                            <th>Đúng giờ</th>
                            <th>Bất thường</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceStats.byEmployee.map((e) => (
                            <tr key={e.employeeCode}>
                              <td>
                                <strong>{e.employeeCode}</strong>
                              </td>
                              <td>{e.totalDays}</td>
                              <td>{e.totalHours.toFixed(1)}h</td>
                              <td>{e.onTime}</td>
                              <td>{e.abnormal}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty">
                      <div className="empty-icon">📭</div>
                      <p>Chưa có dữ liệu chấm công</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 style={{ marginBottom: "10px" }}>⏱️ Làm thêm</h4>
                  {overtimeStats?.byEmployee?.length ? (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Mã NV</th>
                            <th>Số đơn</th>
                            <th>Giờ duyệt</th>
                            <th>Chờ</th>
                            <th>Đã duyệt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {overtimeStats.byEmployee.map((e) => (
                            <tr key={e.employeeCode}>
                              <td>
                                <strong>{e.employeeCode}</strong>
                              </td>
                              <td>{e.totalRequests}</td>
                              <td>{e.approvedHours.toFixed(1)}h</td>
                              <td>{e.pending}</td>
                              <td>{e.approved}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty">
                      <div className="empty-icon">📭</div>
                      <p>Chưa có dữ liệu làm thêm</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        {/* ===== Modal Sửa Nhân Viên ===== */}
        {editingEmp && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "16px",
            }}
            onClick={() => setEditingEmp(null)}
          >
            <div
              className="card"
              style={{ maxWidth: "500px", width: "100%", margin: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-header">
                <div className="card-title">
                  <span className="icon">✏️</span> Sửa Nhân Viên
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setEditingEmp(null)}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleUpdateEmployee}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Mã nhân viên</label>
                    <input
                      type="text"
                      value={editingEmp.employeeCode}
                      onChange={(e) =>
                        setEditingEmp({
                          ...editingEmp,
                          employeeCode: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Họ tên</label>
                    <input
                      type="text"
                      value={editingEmp.fullName}
                      onChange={(e) =>
                        setEditingEmp({
                          ...editingEmp,
                          fullName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editingEmp.email}
                    onChange={(e) =>
                      setEditingEmp({ ...editingEmp, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu mới (để trống nếu không đổi)</label>
                  <input
                    type="password"
                    value={editingEmp.password || ""}
                    onChange={(e) =>
                      setEditingEmp({ ...editingEmp, password: e.target.value })
                    }
                    placeholder="Để trống nếu không đổi"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Vai trò</label>
                    <select
                      value={editingEmp.role}
                      onChange={(e) =>
                        setEditingEmp({ ...editingEmp, role: e.target.value })
                      }
                    >
                      <option value="Employee">Nhân viên</option>
                      <option value="Manager">Quản lý</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Phòng ban</label>
                    <input
                      type="text"
                      value={editingEmp.department || ""}
                      onChange={(e) =>
                        setEditingEmp({
                          ...editingEmp,
                          department: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    value={editingEmp.phone || ""}
                    onChange={(e) =>
                      setEditingEmp({ ...editingEmp, phone: e.target.value })
                    }
                  />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" className="btn btn-primary">
                    Lưu
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setEditingEmp(null)}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===== Modal Sửa Chi Nhánh ===== */}
        {editingWp && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "16px",
            }}
            onClick={() => setEditingWp(null)}
          >
            <div
              className="card"
              style={{ maxWidth: "500px", width: "100%", margin: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-header">
                <div className="card-title">
                  <span className="icon">✏️</span> Sửa Chi Nhánh
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setEditingWp(null)}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleUpdateWorkplace}>
                <div className="form-group">
                  <label>Tên chi nhánh</label>
                  <input
                    type="text"
                    value={editingWp.name}
                    onChange={(e) =>
                      setEditingWp({ ...editingWp, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    value={editingWp.address}
                    onChange={(e) =>
                      setEditingWp({ ...editingWp, address: e.target.value })
                    }
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" className="btn btn-primary">
                    Lưu
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setEditingWp(null)}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===== Modal Sửa Phòng Ban ===== */}
        {editingDept && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "16px",
            }}
            onClick={() => setEditingDept(null)}
          >
            <div
              className="card"
              style={{ maxWidth: "500px", width: "100%", margin: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-header">
                <div className="card-title">
                  <span className="icon">✏️</span> Sửa Phòng Ban
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setEditingDept(null)}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleUpdateDepartment}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Mã phòng ban</label>
                    <input
                      type="text"
                      value={editingDept.departmentCode}
                      onChange={(e) =>
                        setEditingDept({
                          ...editingDept,
                          departmentCode: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên phòng ban</label>
                    <input
                      type="text"
                      value={editingDept.name}
                      onChange={(e) =>
                        setEditingDept({ ...editingDept, name: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    value={editingDept.description || ""}
                    onChange={(e) =>
                      setEditingDept({
                        ...editingDept,
                        description: e.target.value,
                      })
                    }
                    rows="2"
                  />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" className="btn btn-primary">
                    Lưu
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setEditingDept(null)}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===== Modal Sửa Ca Làm ===== */}
        {editingShift && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "16px",
            }}
            onClick={() => setEditingShift(null)}
          >
            <div
              className="card"
              style={{ maxWidth: "500px", width: "100%", margin: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-header">
                <div className="card-title">
                  <span className="icon">✏️</span> Sửa Ca Làm
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setEditingShift(null)}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleUpdateShift}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Mã ca</label>
                    <input
                      type="text"
                      value={editingShift.shiftCode}
                      onChange={(e) =>
                        setEditingShift({
                          ...editingShift,
                          shiftCode: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên ca</label>
                    <input
                      type="text"
                      value={editingShift.shiftName}
                      onChange={(e) =>
                        setEditingShift({
                          ...editingShift,
                          shiftName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Giờ bắt đầu</label>
                    <input
                      type="time"
                      value={editingShift.startTime}
                      onChange={(e) =>
                        setEditingShift({
                          ...editingShift,
                          startTime: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Giờ kết thúc</label>
                    <input
                      type="time"
                      value={editingShift.endTime}
                      onChange={(e) =>
                        setEditingShift({
                          ...editingShift,
                          endTime: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Thời gian nghỉ (phút)</label>
                  <input
                    type="number"
                    value={editingShift.breakTime}
                    onChange={(e) =>
                      setEditingShift({
                        ...editingShift,
                        breakTime: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" className="btn btn-primary">
                    Lưu
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setEditingShift(null)}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
