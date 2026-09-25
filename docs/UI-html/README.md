# VietWeather - Hệ Thống Tra Cứu Thời Tiết & Quản Trị Danh Mục Địa Phương

Dự án bài tập thực hành môn **Lập trình Web** - Học viện Công nghệ Bưu chính Viễn thông (PTIT).
Xây dựng theo đề cương yêu cầu trong tài liệu nhóm: `doc_laptrinhweb_nhom.docx`.

---

## 🌟 Tính Năng Hoàn Thiện Theo Yêu Cầu Đề Cương

| Mã Use Case | Tên Chức Năng | File Giao Diện | Trạng Thái & Mô Tả |
| :--- | :--- | :--- | :--- |
| **UC01** | **Xem thời tiết trang chủ** | [`index.html`](file:///Users/son/Workspaces/bt_lap_trinh_web/bai_tap_nhom/index.html) | Lưới thẻ thời tiết các thành phố lớn (Hà Nội, TP.HCM, Đà Nẵng, Sa Pa, Đà Lạt...). Tích hợp lọc theo vùng miền (Bắc, Trung, Nam) và đồng hồ thời gian thực. |
| **UC02** | **Tìm kiếm & Chi tiết thời tiết** | [`detail.html`](file:///Users/son/Workspaces/bt_lap_trinh_web/bai_tap_nhom/detail.html) | Tra cứu nhanh tên thành phố. Xem chi tiết: nhiệt độ, cảm giác như, độ ẩm, tốc độ gió, tia UV, áp suất, **biểu đồ nhiệt độ 24 giờ bằng Chart.js** và **dự báo 7 ngày**. |
| **UC03** | **Đăng nhập quản trị (Admin)** | [`login.html`](file:///Users/son/Workspaces/bt_lap_trinh_web/bai_tap_nhom/login.html) | Xác thực tài khoản Admin (`admin` / `123456`). Bảo vệ phiên làm việc (Session). |
| **UC04** | **CRUD Quản lý địa phương** | [`admin.html`](file:///Users/son/Workspaces/bt_lap_trinh_web/bai_tap_nhom/admin.html) | Thêm, Sửa, Xóa tỉnh/thành phố và cấu hình toạ độ (Kinh độ, Vĩ độ), bật/tắt hiển thị nổi bật ở trang chủ. |
| **UC05** | **Thống kê đơn giản** | [`admin.html`](file:///Users/son/Workspaces/bt_lap_trinh_web/bai_tap_nhom/admin.html) | 4 thẻ KPI thống kê tổng số địa phương theo dõi, phân loại theo khu vực Miền Bắc, Miền Trung, Miền Nam. |
| **Điểm cộng** | **Tự động lấy toạ độ Geocoding** | Modal trong `admin.html` | Khi gõ tên tỉnh/thành phố, bấm "Tự lấy toạ độ" hệ thống tự động điền kinh độ và vĩ độ chuẩn. |

---

## 🚀 Cách Chạy & Thử Nghiệm

1. **Mở trực tiếp trên trình duyệt**:
   - Nhấp đúp chuột vào file [`index.html`](file:///Users/son/Workspaces/bt_lap_trinh_web/bai_tap_nhom/index.html) để mở trên Google Chrome / Safari / Edge.
2. **Hoặc chạy máy chủ cục bộ (Live Server / Python)**:
   ```bash
   python3 -m http.server 8080
   ```
   Sau đó truy cập: `http://localhost:8080/index.html`

---

## 🔑 Tài Khoản Quản Trị (Admin Login)

- **Đường dẫn**: [`login.html`](file:///Users/son/Workspaces/bt_lap_trinh_web/bai_tap_nhom/login.html)
- **Tên đăng nhập**: `admin`
- **Mật khẩu**: `123456`

---

## 📡 Cơ Chế Mô Phỏng Dữ Liệu Open-Meteo API

Trong file [`js/weather-api.js`](file:///Users/son/Workspaces/bt_lap_trinh_web/bai_tap_nhom/js/weather-api.js):
- Cấu trúc dữ liệu trả về chuẩn 100% định dạng JSON của **Open-Meteo REST API**:
  - `current`: Các thông số thời tiết thời gian thực.
  - `hourly`: Dự báo 24 giờ phục vụ vẽ biểu đồ Chart.js.
  - `daily`: Dự báo 7 ngày và giải mã mã thời tiết WMO sang Tiếng Việt.
- Chạy hoàn toàn độc lập, không phụ thuộc kết nối internet khi bảo vệ / demo trước giảng viên.
- Nếu muốn chuyển sang gọi API trực tiếp, chỉ cần đổi biến:
  ```javascript
  const SIMULATE_OPEN_METEO = false;
  ```
