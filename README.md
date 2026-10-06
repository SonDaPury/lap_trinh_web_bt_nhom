# Location Weather App (MVC - JSP & Servlet)

Ứng dụng Web quản lý Địa điểm và theo dõi Thời tiết thời gian thực, xây dựng theo mô hình **MVC (Model - View - Controller)** chuẩn mực, sử dụng **JSP, Servlet, MySQL 8.0**, giao diện **HTML5, CSS3, JavaScript, Bootstrap 5**, tích hợp **REST API bên thứ 3 (Open-Meteo)** và đóng gói sẵn sàng chạy trên mọi hệ điều hành bằng **Docker & Apache Tomcat 10**.

---

## 📑 Mục lục

1. [Giới thiệu & Tính năng](#1-giới-thiệu--tính-năng)
2. [Tech Stack](#2-tech-stack)
3. [Giải thích cấu trúc thư mục](#3-giải-thích-cấu-trúc-thư-mục)
4. [Hướng dẫn chạy bằng Docker (Khuyên dùng)](#4-hướng-dẫn-chạy-bằng-docker-khuyên-dùng)
5. [Hướng dẫn chạy cục bộ (Local Development)](#5-hướng-dẫn-chạy-cục-bộ-local-development)
6. [Cấu hình Cơ sở dữ liệu (MySQL 8.0)](#6-cấu-hình-cơ-sở-dữ-liệu-mysql-80)
7. [Tích hợp REST API Open-Meteo](#7-tích-hợp-rest-api-open-meteo)
8. [Hướng dẫn tự triển khai CRUD Địa điểm theo mô hình MVC](#8-hướng-dẫn-tự-triển-khai-crud-địa-điểm-theo-mô-hình-mvc)
9. [Xử lý sự cố thường gặp (Troubleshooting)](#9-xử-lý-sự-cố-thường-gặp-troubleshooting)

---

## 1. Giới thiệu & Tính năng

Dự án cung cấp một khung sườn (boilerplate/skeleton) hoàn chỉnh, chuẩn chỉ cho đồ án hoặc bài tập lớn môn Lập trình Web:

- **CRUD Địa điểm**: Thêm (Create), Đọc/Xem danh sách & Chi tiết (Read), Chỉnh sửa (Update), Xóa (Delete) các địa điểm địa lý (tên thành phố, kinh độ, vĩ độ, mô tả).
- **Cảnh báo Thời tiết Cực đoan**: Tự động nhận diện và hiển thị banner cảnh báo (Mưa dông, Mưa lớn, Nhiệt độ vượt ngưỡng) ngay tại trang chủ dựa trên mã WMO code và thông số nhiệt độ thời gian thực.
- **Tích hợp REST API Thời tiết**: Gọi API miễn phí [Open-Meteo](https://open-meteo.com) dựa trên kinh độ (`longitude`) và vĩ độ (`latitude`) của địa điểm để lấy dữ liệu thời tiết thực tế (Nhiệt độ, Độ ẩm, Tốc độ gió, Khả năng mưa, Dự báo nhiều ngày).
- **Chạy đa nền tảng qua Docker**: Không phụ thuộc vào cài đặt môi trường phức tạp trên máy cá nhân (Windows, macOS, Linux). Chỉ cần chạy `docker compose up` là toàn bộ cơ sở dữ liệu MySQL 8.0 và máy chủ Web Tomcat sẽ tự động khởi động Native siêu tốc.

---

## 2. Tech Stack

| Thành phần                | Công nghệ sử dụng               | Phiên bản / Chi tiết                                                 |
| :------------------------ | :------------------------------ | :------------------------------------------------------------------- |
| **Kiến trúc**             | MVC (Model - View - Controller) | Phân tách rõ ràng Business Logic, Data Access, Controller và UI      |
| **Ngôn ngữ & Nền tảng**   | Java                            | Java 17 LTS / OpenJDK 17+                                            |
| **Web Server / Servlet**  | Apache Tomcat & Jakarta EE      | Tomcat 10.1.x / Jakarta Servlet API 6.0                              |
| **Giao diện (View)**      | JSP + JSTL + HTML5, CSS3, JS    | JSTL 3.0, Bootstrap 5.3.3, Bootstrap Icons 1.11                      |
| **Cơ sở dữ liệu**         | MySQL Database                  | MySQL 8.0 (Native multi-arch ARM64 + AMD64), `mysql-connector-j` 8.3 |
| **REST API bên thứ 3**    | Open-Meteo Forecast API         | Miễn phí, không cần API Key, chuẩn JSON                              |
| **Xử lý JSON**            | Google Gson                     | 2.10.1                                                               |
| **Quản lý dự án & Build** | Apache Maven                    | Maven 3.9+                                                           |
| **Đóng gói & Chạy**       | Docker & Docker Compose         | Multi-stage build (Maven -> Tomcat runtime)                          |

---

## 3. Giải thích cấu trúc thư mục

Toàn bộ dự án tuân thủ cấu trúc thư mục chuẩn của **Maven Standard Directory Layout**:

```
location-weather-app/
├── pom.xml                         # File cấu hình Maven (dependencies, plugins, packaging WAR)
├── Dockerfile                      # File cấu hình build image Docker (Multi-stage: Maven -> Tomcat)
├── docker-compose.yml              # File điều phối khởi chạy MySQL 8.0 & Tomcat Web App
├── run.sh                          # Script điều khiển nhanh cho macOS / Linux
├── run.bat                         # Script điều khiển nhanh cho Windows (CMD / PowerShell)
├── .env.example                    # File mẫu định nghĩa các biến môi trường
├── .env                            # File chứa biến môi trường thực tế (tài khoản DB, cổng mạng...)
├── .gitignore                      # Cấu hình bỏ qua các file sinh tự động, file rác IDE, binary
├── docs/                           # Thư mục chứa tài liệu hướng dẫn kỹ thuật
│   └── ARCHITECTURE.md             # Tài liệu mô tả chi tiết kiến trúc MVC & luồng dữ liệu
└── src/
    ├── main/
    │   ├── java/
    │   │   └── com/
    │   │       └── weathertracker/
    │   │           ├── config/     # [M - Config] Cấu hình DBContext, kết nối JDBC MySQL
    │   │           ├── model/      # [M - Entity] Các lớp đối tượng dữ liệu (Location, WeatherData...)
    │   │           ├── dao/        # [M - DAO] Tương tác dữ liệu với MySQL (LocationDAO)
    │   │           ├── service/    # [M - Service] Nghiệp vụ gọi REST API Open-Meteo, xử lý JSON
    │   │           ├── controller/ # [C - Controller] Các Servlet xử lý HTTP Request (List, Add, Edit, Delete)
    │   │           └── util/       # [Util] Các lớp tiện ích hỗ trợ (Format ngày tháng, chuyển đổi mã WMO...)
    │   ├── resources/
    │   │   └── db.properties       # Cấu hình chuỗi kết nối MySQL dùng khi chạy Local
    │   └── webapp/                 # [V - View] Giao diện người dùng
    │       ├── index.jsp           # Trang chủ chào mừng và tổng quan dự án
    │       ├── WEB-INF/
    │       │   ├── web.xml         # File cấu hình Deployment Descriptor (filter encoding, servlet mapping)
    │       │   └── views/          # Thư mục chứa các trang JSP được bảo vệ (an toàn, chỉ mở qua Servlet)
    │       │       ├── common/     # Header, Footer, Navbar dùng chung
    │       │       ├── location/   # Trang danh sách (list.jsp), biểu mẫu (form.jsp), chi tiết (detail.jsp)
    │       │       └── error/      # Các trang hiển thị lỗi 404, 500
    │       └── static/             # Các tài nguyên tĩnh (Static Assets)
    │           ├── css/            # Các file định dạng giao diện (style.css)
    │           └── js/             # Các file JavaScript tương tác người dùng (app.js, weather.js)
    └── test/                       # Thư mục viết Unit Test (JUnit 5)
```

---

## 4. Hướng dẫn chạy bằng Docker (Khuyên dùng)

Cách này đảm bảo **chạy được trên mọi hệ điều hành** (Windows, macOS, Linux) mà **không cần cài đặt Java, Maven, Tomcat hay MySQL** trên máy chủ sở tại!

### ⚡ Sử dụng Script điều khiển nhanh

| Mục đích                                    | macOS / Linux     | Windows (CMD / PowerShell) |
| :------------------------------------------ | :---------------- | :------------------------- |
| **Sửa code xong cần tải lại ngay (Reload)** | `./run.sh`        | `run`                      |
| **Khởi động toàn bộ dự án từ đầu**          | `./run.sh start`  | `run start`                |
| **Dừng hệ thống**                           | `./run.sh stop`   | `run stop`                 |
| **Xem log Tomcat thời gian thực**           | `./run.sh logs`   | `run logs`                 |
| **Xem trạng thái các container**            | `./run.sh status` | `run status`               |
| **Bật riêng MySQL 8.0**                     | `./run.sh db`     | `run db`                   |

> 💡 **Mẹo khi code:** Mỗi khi bạn chỉnh sửa xong mã nguồn Java hoặc JSP, bạn chỉ cần mở terminal gõ:
>
> - Trên Mac/Linux: `./run.sh`
> - Trên Windows: `run`
>
> Script sẽ tự động biên dịch lại code mới và nạp vào Tomcat trong vài giây, đồng thời **giữ nguyên toàn bộ dữ liệu trong MySQL** mà không làm gián đoạn CSDL!

---

### Các bước thực hiện thủ công (Nếu không dùng script):

#### Bước 1: Khởi động hệ thống với Docker Compose

Mở terminal tại thư mục gốc của dự án và chạy:

```bash
docker compose up -d --build
```

#### Bước 2: Cập nhật Webapp sau mỗi lần sửa code

```bash
docker compose up -d --build webapp
```

#### Bước 3: Truy cập ứng dụng

Sau khi khởi động, mở trình duyệt web và truy cập:

- **Trang chủ ứng dụng:** [http://localhost:8080/](http://localhost:8080/)
- **Cổng kết nối MySQL:** `localhost:3306` (Tài khoản: `root` / Mật khẩu: `12345678`, Database: `location_weather_db`)

#### Bước 4: Dừng hệ thống

Để dừng các container khi không sử dụng:

```bash
docker compose down
```

_(Nếu muốn xóa sạch toàn bộ dữ liệu database để khởi tạo lại từ đầu, thêm cờ `-v`: `docker compose down -v`)_

---

## 5. Hướng dẫn chạy cục bộ (Local Development)

Nếu bạn muốn debug trực tiếp bằng IDE (IntelliJ IDEA, Eclipse, VS Code, NetBeans) hoặc dòng lệnh:

### Yêu cầu:

- **JDK 17** hoặc mới hơn (OpenJDK / Oracle JDK).
- **Apache Maven 3.9+**.
- **Apache Tomcat 10.1+** (hỗ trợ chuẩn Jakarta EE 10).
- Máy chủ **MySQL 8.0** đang chạy (hoặc chạy riêng container MySQL: `./run.sh db` hoặc `run db`).

### 1. Biên dịch và đóng gói file WAR bằng Maven:

```bash
mvn clean package
```

Sau khi chạy xong, file `location-weather-app.war` sẽ được tạo trong thư mục `target/`.

### 2. Triển khai lên Tomcat cục bộ:

- Copy file `target/location-weather-app.war` vào thư mục `webapps/` của Apache Tomcat.
- Đổi tên thành `ROOT.war` (nếu muốn chạy tại `http://localhost:8080/`) hoặc giữ nguyên tên (chạy tại `http://localhost:8080/location-weather-app/`).
- Khởi động Tomcat (`bin/startup.sh` hoặc `bin/startup.bat`).

---

## 6. Cấu hình Cơ sở dữ liệu (MySQL 8.0)

### Bảng dữ liệu `locations`:

Bảng quản lý địa điểm lưu trữ thông tin tọa độ địa lý và mô tả (chuẩn cú pháp MySQL):

```sql
CREATE DATABASE IF NOT EXISTS location_weather_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE location_weather_db;

CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    country VARCHAR(100) DEFAULT 'Việt Nam',
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    description VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Dữ liệu mẫu (Seed Data):

```sql
INSERT INTO locations (name, country, latitude, longitude, description)
VALUES
    ('Hà Nội', 'Việt Nam', 21.028511, 105.854167, 'Thủ đô ngàn năm văn hiến với Hồ Gươm và Phố Cổ.'),
    ('TP. Hồ Chí Minh', 'Việt Nam', 10.823099, 106.629664, 'Trung tâm kinh tế sầm uất và năng động.'),
    ('Đà Nẵng', 'Việt Nam', 16.054407, 108.202167, 'Thành phố biển với Cầu Rồng và Bà Nà Hills.'),
    ('Đà Lạt', 'Việt Nam', 11.940419, 108.458313, 'Thành phố ngàn hoa với khí hậu se lạnh quanh năm.');
```

### Kết nối MySQL bằng công cụ ngoài (DBeaver, MySQL Workbench, Navicat, v.v.):

- **Host**: `localhost` (hoặc `127.0.0.1`)
- **Port**: `3306`
- **Username**: `root`
- **Password**: `12345678`
- **Database**: `location_weather_db`

---

## 7. Tích hợp REST API Open-Meteo

API thời tiết **Open-Meteo** là dịch vụ hoàn toàn miễn phí, tốc độ cao, không yêu cầu xác thực API Key.

### Endpoint mẫu:

```http
GET https://api.open-meteo.com/v1/forecast?latitude=21.0285&longitude=105.8542&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto
```

### Cấu trúc JSON phản hồi tiêu biểu:

```json
{
  "latitude": 21.0285,
  "longitude": 105.8542,
  "timezone": "Asia/Bangkok",
  "current": {
    "time": "2026-09-25T10:30",
    "temperature_2m": 26.5,
    "relative_humidity_2m": 82,
    "apparent_temperature": 29.1,
    "is_day": 1,
    "precipitation": 0.0,
    "weather_code": 1,
    "wind_speed_10m": 8.3
  },
  "daily": {
    "time": ["2026-09-25", "2026-09-26", "..."],
    "weather_code": [1, 3, "..."],
    "temperature_2m_max": [31.5, 32.0, "..."],
    "temperature_2m_min": [24.0, 24.5, "..."]
  }
}
```

---

## 8. Hướng dẫn tự triển khai CRUD Địa điểm theo mô hình MVC

Khi bắt đầu hiện thực hóa các chức năng, bạn làm tuần tự qua 4 bước:

### Bước 1: Tạo Entity & Kết nối CSDL (Model)

1. Tạo class `com.weathertracker.model.Location.java` với các trường: `id`, `name`, `country`, `latitude`, `longitude`, `description`.
2. Tạo class `com.weathertracker.config.DBContext.java`:
   - Driver: `com.mysql.cj.jdbc.Driver`.
   - URL: `jdbc:mysql://localhost:3306/location_weather_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8`.
   - Đọc thông số kết nối từ `System.getenv()` (khi chạy Docker) hoặc file `db.properties` (khi chạy local).

### Bước 2: Tạo lớp DAO (Data Access Object)

Tạo `LocationDAO.java` chứa các câu lệnh SQL an toàn:

- `getAll()`: Thực thi `SELECT * FROM locations ORDER BY id DESC`.
- `getById(int id)`: Thực thi `SELECT * FROM locations WHERE id = ?`.
- `insert(Location loc)`: Thực thi `INSERT INTO locations (name, country, latitude, longitude, description) VALUES (?, ?, ?, ?, ?)`.
- `update(Location loc)`: Thực thi `UPDATE locations SET name = ?, latitude = ?, longitude = ?, description = ? WHERE id = ?`.
- `delete(int id)`: Thực thi `DELETE FROM locations WHERE id = ?`.

### Bước 3: Tạo Service gọi REST API Thời tiết

Tạo `OpenMeteoWeatherService.java`:

- Dùng `HttpClient` gửi yêu cầu GET tới URL Open-Meteo truyền vào `latitude` và `longitude`.
- Dùng `Gson` phân tích kết quả JSON và chuyển đổi `weather_code` sang tiếng Việt.

### Bước 4: Tạo Controller (Servlets) & View (JSP)

- **Danh sách (`/locations`)**:
  - `LocationListServlet.java`: Lấy danh sách từ `LocationDAO.getAll()`, gắn vào `request.setAttribute("locations", list)` và chuyển tiếp sang `/WEB-INF/views/location/list.jsp`.
- **Thêm mới (`/locations/add`)**:
  - GET: Trả về trang biểu mẫu `/WEB-INF/views/location/form.jsp`.
  - POST: Lấy tham số qua `request.getParameter(...)`, kiểm tra validation, gọi `LocationDAO.insert()` rồi redirect về `/locations`.
- **Sửa (`/locations/edit?id=...`)**:
  - GET: Lấy `id`, truy vấn `LocationDAO.getById(id)` và hiển thị form sửa.
  - POST: Cập nhật dữ liệu vào DB và redirect về `/locations`.
- **Xóa (`/locations/delete?id=...`)**:
  - Gọi `LocationDAO.delete(id)` và redirect về `/locations`.
- **Chi tiết & Thời tiết (`/locations/detail?id=...`)**:
  - Lấy thông tin địa điểm theo `id`.
  - Gọi `WeatherService.getWeather(loc.getLatitude(), loc.getLongitude())`.
  - Đưa cả 2 thông tin vào `request` và hiển thị trên giao diện chi tiết đẹp mắt.

---

## 9. Xử lý sự cố thường gặp (Troubleshooting)

| Vấn đề                                            | Nguyên nhân                                         | Cách khắc phục                                                                                                                                                   |
| :------------------------------------------------ | :-------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cổng 3306 đã bị phần mềm khác chiếm**           | Đang có MySQL hoặc XAMPP/WAMP chạy local chiếm cổng | Mở file `.env`, sửa `DB_PORT=3307`, sau đó chạy lại `./run.sh start` hoặc `run start`.                                                                           |
| **Cổng 8080 đã bị ứng dụng khác chiếm**           | Đang có Tomcat khác chạy chiếm cổng                 | Mở file `.env`, sửa `WEB_PORT=8081`, sau đó chạy lại.                                                                                                            |
| **Lỗi Tiếng Việt bị hiển thị dấu chấm hỏi `???`** | Thiếu mã hóa UTF-8 ở tầng Request/Response          | Thêm bộ lọc Encoding Filter trong `web.xml` hoặc gọi `request.setCharacterEncoding("UTF-8")` ở đầu Servlet.                                                      |
| **Lỗi 404 khi truy cập JSP trực tiếp**            | File JSP nằm trong thư mục `WEB-INF/`               | Đây là tính năng bảo mật. Mọi truy cập phải đi qua Servlet Controller bằng lệnh `request.getRequestDispatcher("/WEB-INF/views/...").forward(request, response)`. |
