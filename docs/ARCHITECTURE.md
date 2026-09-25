# Kiến Trúc Hệ Thống (Architecture Guide)

Dự án **Location Weather App** được thiết kế dựa trên mô hình kiến trúc chuẩn **MVC (Model - View - Controller)** kết hợp với việc tích hợp **REST API bên thứ ba (Open-Meteo)** và đóng gói bằng **Docker (Tomcat 10.1 + MySQL 8.0)**.

---

## 1. Mô hình MVC (Model - View - Controller)

```
       +-------------------------------------------------------+
       |                       Client                          |
       |             (Trình duyệt Web / Người dùng)            |
       +-------------------------------------------------------+
                |                                      ^
        1. HTTP Request                       5. HTML / JSON Response
                v                                      |
  +-------------------------------------------------------------------+
  |                             CONTROLLER                            |
  | (Jakarta Servlets: LocationListServlet, AddServlet, EditServlet)  |
  +-------------------------------------------------------------------+
        |                                       ^
   2. Gọi Service / DAO                  4. Dữ liệu Model
        v                                       |
  +-------------------+              +-------------------------------+
  |      SERVICE      |              |             VIEW              |
  |  WeatherService   |              | (JSP + JSTL + Bootstrap 5 +   |
  +-------------------+              |  JavaScript + Icons)          |
        |                            +-------------------------------+
 2.1 HTTP REST GET                             ^
        v                                      |
  +-------------------+                        |
  | Open-Meteo REST   |                        |
  |    (External)     |                        |
  +-------------------+                        |
        |                                      |
        +------------> [WeatherData] ----------+
                              ^
                              |
  +--------------------------------------------+
  |                   MODEL                    |
  |  - Entities: Location, WeatherData         |
  |  - DAO: LocationDAO (JDBC PreparedStatement)
  |  - Connection: DBContext                   |
  +--------------------------------------------+
        |
   3. SQL Query / DML (CRUD)
        v
  +--------------------------------------------+
  |                 MYSQL 8.0                  |
  |            (Database Container)            |
  +--------------------------------------------+
```

---

## 2. Chi tiết từng thành phần

### 2.1. Model (Dữ liệu và Nghiệp vụ)
- **Entity Classes (`model/`)**:
  - `Location.java`: Đại diện cho bảng dữ liệu địa điểm trong cơ sở dữ liệu (`id`, `name`, `country`, `latitude`, `longitude`, `description`, `created_at`, `updated_at`).
  - `WeatherData.java`: Chứa dữ liệu thời tiết thực tế được phân tích từ JSON phản hồi của Open-Meteo (`temperature`, `humidity`, `windSpeed`, `weatherCode`, `description`, `dailyForecasts`).
- **Data Access Object (`dao/`)**:
  - `ILocationDAO.java` & `LocationDAO.java`: Chứa các phương thức CRUD (`findAll`, `findById`, `create`, `update`, `delete`, `search`) sử dụng `PreparedStatement` để tương tác an toàn với MySQL (chống SQL Injection).
- **Database Context (`config/DBContext.java`)**:
  - Quản lý chuỗi kết nối JDBC (`jdbc:mysql://...`).
  - Hỗ trợ lấy tham số từ biến môi trường (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) hoặc tệp cấu hình dự phòng `db.properties`.

### 2.2. Controller (Bộ điều hướng)
- Các lớp Servlet kế thừa từ `jakarta.servlet.http.HttpServlet`.
- Nhiệm vụ:
  - Tiếp nhận các yêu cầu HTTP (GET, POST).
  - Trích xuất và kiểm tra tính hợp lệ của tham số gửi lên từ Client.
  - Điều phối gọi các DAO hoặc Service tương ứng.
  - Đặt dữ liệu vào `request.setAttribute("key", value)`.
  - Chuyển tiếp (forward) sang trang JSP hiển thị hoặc chuyển hướng (redirect) URL.

### 2.3. View (Giao diện hiển thị)
- Sử dụng công nghệ **JSP (JavaServer Pages)** kết hợp thư viện thẻ **JSTL (Jakarta Standard Tag Library)**:
  - `<c:forEach>`: Lặp danh sách địa điểm và dự báo thời tiết.
  - `<c:if>`, `<c:choose>`: Kiểm tra điều kiện hiển thị thông báo, trạng thái thời tiết.
  - EL (Expression Language): `${location.name}`, `${weather.temperature}`.
- Giao diện người dùng:
  - **HTML5 & CSS3**: Bố cục semantic, hiện đại.
  - **Bootstrap 5.3**: Hệ thống lưới (Grid system), Modal, Card, Table, Form responsive trên cả máy tính và điện thoại.
  - **JavaScript**: Thao tác tương tác phía Client, gọi API bất đồng bộ (AJAX/Fetch) để tải nhanh thời tiết mà không cần tải lại toàn bộ trang.

---

## 3. Tích hợp REST API bên thứ ba (Open-Meteo)

### Tại sao chọn Open-Meteo?
- Hoàn toàn miễn phí, mã nguồn mở, không giới hạn phi thương mại.
- **Không yêu cầu API Key**, giúp dự án có thể chạy ngay lập tức trên máy của bất kỳ ai mà không phải đăng ký tài khoản hay lo hết hạn token.

### Quy trình gọi API:
1. Endpoint mẫu:
   ```
   https://api.open-meteo.com/v1/forecast?latitude=21.0285&longitude=105.8542&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto
   ```
2. Trong Java Backend:
   - Sử dụng `java.net.http.HttpClient` (chuẩn tích hợp từ Java 11+).
   - Nhận chuỗi JSON từ Open-Meteo.
   - Phân tích cú pháp (Parse) JSON thành đối tượng Java POJO bằng thư viện **Google Gson**.
   - Chuyển đổi mã thời tiết **WMO Weather Code** thành chuỗi mô tả tiếng Việt (Trời quang, Mưa rào, Có mây, Giông bão...) và biểu tượng tương ứng.

---

## 4. Kiến trúc Container Docker

Dự án được đóng gói thành 2 container độc lập liên kết qua Docker Network nội bộ:

1. **`location_mysql`**:
   - Chạy trên image chính thức `mysql:8.0` hỗ trợ **Native Multi-Architecture (cả ARM64 và AMD64)**.
   - Chạy trực tiếp siêu tốc trên cả Apple Silicon (M1/M2/M3/M4), Intel/AMD Windows và Linux mà không cần giả lập Rosetta!
   - Tự động tạo sẵn database `location_weather_db`.
   - Lưu trữ dữ liệu bền vững qua Docker Named Volume `mysql_data`.
   - Tích hợp kiểm tra sức khỏe (`healthcheck`) đảm bảo cổng 3306 sẵn sàng trước khi Webapp kết nối.

2. **`location_webapp`**:
   - Sử dụng kỹ thuật **Multi-stage Docker Build**:
     - **Stage 1 (Builder)**: Sử dụng `maven:3.9-eclipse-temurin-17` để tải dependencies và biên dịch mã nguồn thành file `location-weather-app.war`.
     - **Stage 2 (Runtime)**: Sử dụng `tomcat:10.1-jdk17-temurin`, chỉ copy file WAR thành `ROOT.war`. Giúp dung lượng container nhẹ, an toàn và tối ưu thời gian khởi chạy.
