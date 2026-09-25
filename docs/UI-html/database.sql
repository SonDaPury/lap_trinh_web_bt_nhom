-- ========================================================
-- DỰ ÁN BÀI TẬP THỰC HÀNH LẬP TRÌNH WEB (PTIT)
-- Đề tài: Website Tra Cứu Thời Tiết Tích Hợp Open-Meteo API
-- Hệ quản trị CSDL: Microsoft SQL Server 2022
-- Khớp chính xác với Mục 2.2 trong file Báo cáo nhóm
-- ========================================================

-- 1. Tạo cơ sở dữ liệu
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'VietWeatherDB')
BEGIN
    CREATE DATABASE VietWeatherDB;
END
GO

USE VietWeatherDB;
GO

-- 2. Xóa bảng cũ nếu đã tồn tại (để reset dữ liệu sạch)
IF OBJECT_ID('dbo.Locations', 'U') IS NOT NULL DROP TABLE dbo.Locations;
IF OBJECT_ID('dbo.Admins', 'U') IS NOT NULL DROP TABLE dbo.Admins;
GO

-- 3. Bảng quản trị viên (Admin) - UC03 Đăng nhập quản trị
CREATE TABLE Admins (
    admin_id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,          -- Mật khẩu mặc định: 123456
    full_name NVARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- 4. Bảng địa phương / khu vực (Locations) - Đối tượng chính quản lý CRUD (UC04)
CREATE TABLE Locations (
    location_id INT IDENTITY(1,1) PRIMARY KEY,
    city_name NVARCHAR(100) NOT NULL,
    region NVARCHAR(50) NOT NULL,             -- Miền: 'Bắc', 'Trung', 'Nam'
    latitude DECIMAL(9, 6) NOT NULL,          -- Vĩ độ địa lý
    longitude DECIMAL(9, 6) NOT NULL,         -- Kinh độ địa lý
    is_featured BIT DEFAULT 1,                -- 1: Hiển thị nổi bật trang chủ, 0: Ẩn
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- ========================================================
-- CHÈN DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- ========================================================

-- Dữ liệu tài khoản quản trị mẫu
INSERT INTO Admins (username, password, full_name)
VALUES ('admin', '123456', N'Quản Trị Viên Hệ Thống');
GO

-- Dữ liệu danh mục 9 tỉnh/thành phố tiêu biểu phân bố 3 miền Bắc - Trung - Nam
INSERT INTO Locations (city_name, region, latitude, longitude, is_featured)
VALUES 
    (N'Hà Nội', N'Bắc', 21.028500, 105.854200, 1),
    (N'TP. Hồ Chí Minh', N'Nam', 10.823100, 106.629700, 1),
    (N'Đà Nẵng', N'Trung', 16.054400, 108.202200, 1),
    (N'Hải Phòng', N'Bắc', 20.844900, 106.688100, 1),
    (N'Cần Thơ', N'Nam', 10.045200, 105.746900, 1),
    (N'Huế', N'Trung', 16.463700, 107.590900, 1),
    (N'Đà Lạt', N'Trung', 11.940400, 108.458300, 1),
    (N'Nha Trang', N'Trung', 12.238800, 109.196700, 0),
    (N'Sa Pa', N'Bắc', 22.336400, 103.843800, 0);
GO

-- ========================================================
-- TRUY VẤN KIỂM TRA DỮ LIỆU
-- ========================================================
SELECT * FROM Admins;
SELECT * FROM Locations ORDER BY region, city_name;
GO
