@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM =============================================================
REM Script điều khiển dự án nhanh cho Windows (MySQL + Tomcat)
REM =============================================================

set COMMAND=%1
if "%COMMAND%"=="" set COMMAND=reload

if /i "%COMMAND%"=="reload" goto :reload
if /i "%COMMAND%"=="r" goto :reload
if /i "%COMMAND%"=="start" goto :start
if /i "%COMMAND%"=="up" goto :start
if /i "%COMMAND%"=="stop" goto :stop
if /i "%COMMAND%"=="down" goto :stop
if /i "%COMMAND%"=="logs" goto :logs
if /i "%COMMAND%"=="log" goto :logs
if /i "%COMMAND%"=="l" goto :logs
if /i "%COMMAND%"=="db" goto :db
if /i "%COMMAND%"=="status" goto :status
if /i "%COMMAND%"=="ps" goto :status
goto :help

:reload
echo [1/2] Đang biên dịch mã nguồn và nạp lại Webapp vào Tomcat...
docker compose up -d --build webapp
echo [2/2] Webapp đã sẵn sàng!
echo.
echo URL Trang chủ : http://localhost:8080/
echo URL Trạng thái: http://localhost:8080/status
echo.
echo --- NHẬT KÝ HOẠT ĐỘNG GẦN NHẤT ---
docker compose logs --tail=15 webapp
goto :eof

:start
echo =============================================================
echo   KHỞI ĐỘNG HỆ THỐNG: MYSQL 8.0 VÀ APACHE TOMCAT 10.1
echo =============================================================
docker compose up -d --build
echo.
echo Đã khởi động thành công! Đang tải log hệ thống...
timeout /t 2 >nul
docker compose logs --tail=25 webapp
echo.
echo URL Webapp: http://localhost:8080/
echo URL MySQL : localhost:3306 (User: root / Pass: 12345678)
goto :eof

:stop
echo Đang dừng toàn bộ container...
docker compose down
echo Đã dừng hệ thống thành công.
goto :eof

:logs
echo Đang theo dõi log thời gian thực của Webapp (Ctrl+C để thoát)...
docker compose logs -f webapp
goto :eof

:db
echo Đang khởi động riêng MySQL 8.0...
docker compose up -d mysql
echo MySQL đang chạy tại localhost:3306.
goto :eof

:status
docker compose ps
goto :eof

:help
echo =============================================================
echo   Location Weather App - Hướng dẫn sử dụng run.bat (MySQL)
echo =============================================================
echo   run          (hoặc run reload) : Rebuild và cập nhật nhanh Webapp sau khi sửa code
echo   run start    (hoặc run up)     : Khởi động toàn bộ hệ thống từ đầu
echo   run stop     (hoặc run down)   : Dừng toàn bộ container
echo   run logs                       : Xem log thời gian thực của Tomcat
echo   run status                     : Xem trạng thái các container
echo   run db                         : Bật riêng MySQL 8.0
echo =============================================================
goto :eof
