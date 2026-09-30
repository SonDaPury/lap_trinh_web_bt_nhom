<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VietWeather - Dự Báo Thời Tiết Việt Nam</title>

    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <!-- Custom Bright Stylesheet -->
    <link rel="stylesheet" href="static/css/style.css">
</head>
<body>

<!-- Ambient Sky Glow Orbs -->
<div class="ambient-glow-1"></div>
<div class="ambient-glow-2"></div>

<!-- ================= FLOATING GLASS NAVBAR ================= -->
<nav class="navbar navbar-expand-lg navbar-floating py-3">
    <div class="container">
        <a class="navbar-brand d-flex align-items-center" href="${pageContext.request.contextPath}/">
            <div class="p-2 rounded-3 me-2 d-flex align-items-center justify-content-center"
                 style="background: #e0f2fe; border: 1px solid #bae6fd;">
                <i class="bi bi-cloud-sun-fill text-warning fs-4"></i>
            </div>
            <span class="fs-4 navbar-brand-logo">Viet<span class="text-dark">Weather</span></span>
        </a>

        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
            <i class="bi bi-list fs-2 text-dark"></i>
        </button>

        <div class="collapse navbar-collapse" id="mainNav">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-1">
                <li class="nav-item">
                    <a class="nav-link nav-link-custom active" href="${pageContext.request.contextPath}/">
                        <i class="bi bi-compass me-1"></i> Khám phá
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link nav-link-custom" href="#weather-list-section">
                        <i class="bi bi-grid-fill me-1"></i> Tỉnh thành
                    </a>
                </li>
                <li class="nav-item">
                    <button class="nav-link nav-link-custom btn btn-link text-decoration-none" data-bs-toggle="modal"
                            data-bs-target="#compareModal">
                        <i class="bi bi-arrow-left-right me-1 text-primary"></i> So sánh thời tiết
                    </button>
                </li>
                <li class="nav-item">
                    <a class="nav-link nav-link-custom" href="#" data-bs-toggle="modal" data-bs-target="#infoModal">
                        <i class="bi bi-info-circle me-1"></i> Về đề tài
                    </a>
                </li>
            </ul>

            <div class="d-flex align-items-center gap-2">
                <span class="btn-glass-pill d-none d-md-inline-flex" style="pointer-events: none;">
                    <span class="spinner-grow spinner-grow-sm text-success me-2" role="status"></span>
                    Open-Meteo REST API
                </span>

                <c:choose>
                    <c:when test="${not empty sessionScope.adminUser}">
                        <a href="${pageContext.request.contextPath}/admin/dashboard" class="btn btn-spotlight-action px-3 py-2 fw-semibold">
                            <i class="bi bi-speedometer2 me-1"></i> Bảng điều khiển
                        </a>
                        <a href="${pageContext.request.contextPath}/admin/logout" class="btn btn-outline-danger px-3 py-2 fw-semibold">
                            <i class="bi bi-box-arrow-right"></i>
                        </a>
                    </c:when>
                    <c:otherwise>

                    </c:otherwise>
                </c:choose>
            </div>
        </div>
    </div>
</nav>
<!-- ================= MAIN CONTAINER ================= -->
<main class="container my-4 my-md-5 position-relative" style="z-index: 1;">

    <!-- HERO DAYLIGHT SPOTLIGHT BANNER -->
    <section class="hero-spotlight mb-5">
        <div class="row align-items-center">
            <div class="col-lg-8">
                <div class="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3"
                     style="background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.35);">
                    <i class="bi bi-stars text-warning"></i>
                    <span class="small fw-bold text-white">Khí tượng thủy văn Việt Nam</span>
                </div>

                <h1 class="hero-heading mb-3">
                    Tra cứu thời tiết trực quan &amp; thời gian thực.
                </h1>
                <p class="text-white-50 fs-6 mb-4 pe-lg-4">
                    Dữ liệu khí hậu theo mô hình Open-Meteo REST API với độ chính xác cao: nhiệt độ, độ ẩm, tốc độ gió
                    và dự báo 7 ngày theo kinh độ/vĩ độ.
                </p>

                <!-- Spotlight Search Box (Clean White) -->
                <form action="${pageContext.request.contextPath}/" method="GET" class="spotlight-search-box mb-3">
                    <i class="bi bi-search text-muted fs-5 me-2"></i>
                    <input type="text" id="searchInput" name="q" value="${param.q}"
                           placeholder="Tìm theo tên thành phố (Hà Nội, TP.HCM, Đà Nẵng, Sa Pa...)..."
                           autocomplete="off">
                    <button type="button" class="btn btn-glass-pill me-2 d-none d-sm-inline-flex align-items-center py-2 px-3"
                            id="geolocateBtn" title="Lấy toạ độ GPS của bạn">
                        <i class="bi bi-crosshair text-primary me-1"></i> Vị trí của tôi
                    </button>
                    <button type="submit" class="btn btn-spotlight-action py-2 px-4" id="searchBtn">
                        Tra cứu
                    </button>
                </form>

                <!-- Quick Trending Tags -->
                <div class="d-flex flex-wrap align-items-center gap-2">
                    <span class="text-white-50 small me-1">Tìm nhanh:</span>
                    <a href="${pageContext.request.contextPath}/?q=Hà+Nội" class="btn btn-sm btn-glass-pill py-1 px-3 text-decoration-none">Hà Nội</a>
                    <a href="${pageContext.request.contextPath}/?q=TP.+Hồ+Chí+Minh" class="btn btn-sm btn-glass-pill py-1 px-3 text-decoration-none">TP. Hồ Chí Minh</a>
                    <a href="${pageContext.request.contextPath}/?q=Đà+Lạt" class="btn btn-sm btn-glass-pill py-1 px-3 text-decoration-none">Đà Lạt</a>
                    <a href="${pageContext.request.contextPath}/?q=Đà+Nẵng" class="btn btn-sm btn-glass-pill py-1 px-3 text-decoration-none">Đà Nẵng</a>
                    <a href="${pageContext.request.contextPath}/?q=Sa+Pa" class="btn btn-sm btn-glass-pill py-1 px-3 text-decoration-none">Sa Pa</a>
                </div>
            </div>

            <div class="col-lg-4 text-center mt-4 mt-lg-0 d-none d-lg-block">
                <div class="bento-card p-4 text-center bg-white shadow-sm">
                    <div class="pulse-glow mb-2">
                        <i class="bi bi-cloud-sun-fill"
                           style="font-size: 5.5rem; color: #f59e0b; filter: drop-shadow(0 10px 20px rgba(245, 158, 11, 0.3));"></i>
                    </div>
                    <h4 class="fw-bold text-dark mb-1" id="heroTime">--:--</h4>
                    <p class="text-muted small mb-0" id="heroDate">Đang cập nhật...</p>
                </div>
            </div>
        </div>
    </section>

    <!-- EXTREME WEATHER ALERT BANNER -->
    <div id="extremeWeatherAlertBanner"
         class="alert bento-card border-0 mb-4 p-3 ${not empty weatherAlert ? '' : 'd-none'} animate-fade-in"
         style="background: #fef2f2; border: 1.5px solid #fecaca !important;">
        <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
                <div class="p-2 rounded-circle me-3 fs-5 d-flex align-items-center justify-content-center"
                     style="background: #ef4444; width: 40px; height: 40px;">
                    <i class="bi bi-exclamation-triangle-fill text-white"></i>
                </div>
                <div>
                    <h6 class="fw-bold mb-0 text-danger" id="alertBannerTitle">
                        <c:out value="${not empty alertTitle ? alertTitle : '⚠️ CẢNH BÁO KHÍ TƯỢNG ĐẶC BIỆT'}" />
                    </h6>
                    <p class="small mb-0 text-danger-emphasis" id="alertBannerMessage">
                        <c:out value="${weatherAlert}" default="Đang theo dõi..." />
                    </p>
                </div>
            </div>
            <button type="button" class="btn-close" onclick="dismissAlertBanner()"></button>
        </div>
    </div>

    <!-- FILTER & TITLE SECTION -->
    <section id="weather-list-section" class="mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
                <h3 class="fw-bold text-dark mb-1">
                    <i class="bi bi-geo-alt-fill text-primary me-2"></i>Thời Tiết Khu Vực Trọng Điểm
                </h3>
                <p class="text-muted small mb-0">Các địa phương được ưu tiên theo dõi trên hệ thống giám sát</p>
            </div>

            <!-- Filter Buttons by Region (Bắc, Trung, Nam) -->
            <ul class="nav nav-pills filter-pills">
                <li class="nav-item">
                    <button class="nav-link active" data-region="ALL" id="filterAll">
                        Tất cả <span class="badge bg-light text-secondary border ms-1" id="countAll">${not empty locations ? locations.size() : 0}</span>
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-region="Bắc" id="filterBac">
                        Miền Bắc <span class="badge bg-light text-secondary border ms-1" id="countBac">0</span>
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-region="Trung" id="filterTrung">
                        Miền Trung <span class="badge bg-light text-secondary border ms-1" id="countTrung">0</span>
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-region="Nam" id="filterNam">
                        Miền Nam <span class="badge bg-light text-secondary border ms-1" id="countNam">0</span>
                    </button>
                </li>
            </ul>
        </div>

        <!-- WEATHER CARDS CONTAINER (BENTO GRID) -->
        <div id="weatherGrid" class="row g-4">
            <c:choose>
                <%-- Render trực tiếp từ Server nếu Controller đã truyền dữ liệu --%>
                <c:when test="${not empty locationsWithWeather}">
                    <c:forEach var="item" items="${locationsWithWeather}">
                        <div class="col-md-6 col-lg-4 weather-card-item" data-region="${item.location.regionName}" data-city="${item.location.cityName}">
                            <div class="bento-card p-4 h-100 position-relative shadow-sm bg-white">
                                <div class="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <span class="badge bg-primary-subtle text-primary mb-1">${item.location.regionName}</span>
                                        <h4 class="fw-bold text-dark mb-0">${item.location.cityName}</h4>
                                    </div>
                                    <i class="bi ${item.weather.weatherIcon} fs-1 text-warning"></i>
                                </div>
                                <div class="d-flex align-items-baseline gap-2 mb-3">
                                    <span class="display-5 fw-bold text-dark">${item.weather.temperature}°C</span>
                                    <span class="text-muted fs-6">${item.weather.weatherDescription}</span>
                                </div>
                                <div class="d-flex justify-content-between border-top pt-3 small text-muted">
                                    <span><i class="bi bi-droplet-fill text-info me-1"></i>Độ ẩm: <b>${item.weather.humidity}%</b></span>
                                    <span><i class="bi bi-wind text-secondary me-1"></i>Gió: <b>${item.weather.windSpeed} km/h</b></span>
                                </div>
                                <div class="mt-3">
                                    <a href="${pageContext.request.contextPath}/detail?id=${item.location.locationId}" class="btn btn-sm btn-light w-100 text-primary fw-semibold">
                                        Xem chi tiết &amp; 7 ngày <i class="bi bi-chevron-right ms-1"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </c:forEach>
                </c:when>

                <%-- Fallback chờ JavaScript gọi Open-Meteo API Client-side --%>
                <c:otherwise>
                    <div class="col-12 text-center py-5">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="mt-2 text-muted fw-semibold">Đang cập nhật dữ liệu khí tượng Open-Meteo...</p>
                    </div>
                </c:otherwise>
            </c:choose>
        </div>

        <!-- No Results Found Alert -->
        <div id="noResultsAlert" class="bento-card text-center p-5 mt-3 d-none bg-white">
            <i class="bi bi-search fs-1 text-muted mb-3 d-block"></i>
            <h5 class="fw-bold text-dark">Không tìm thấy địa phương phù hợp</h5>
            <p class="text-muted mb-3">Vui lòng thử với từ khóa khác hoặc xem tất cả địa điểm.</p>
            <a href="${pageContext.request.contextPath}/" class="btn btn-spotlight-action px-4 py-2 text-decoration-none">
                <i class="bi bi-arrow-counterclockwise me-1"></i> Xem tất cả địa phương
            </a>
        </div>
    </section>
</main>

<!-- ================= MODAL SO SÁNH THỜI TIẾT (COMPARE MODAL) ================= -->
<div class="modal fade" id="compareModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content modal-content-glass border-0">
            <div class="modal-header border-0 pb-0">
                <h5 class="modal-title fw-bold text-dark">
                    <i class="bi bi-arrow-left-right text-primary me-2"></i>So Sánh Thời Tiết Giữa 2 Địa Phương
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body py-4">
                <div class="row g-3 mb-4">
                    <div class="col-md-6">
                        <label class="form-label fw-bold small text-muted">Chọn địa phương 1:</label>
                        <select id="compareCity1" class="form-select">
                            <c:forEach var="loc" items="${locations}">
                                <option value="${loc.cityName}" data-lat="${loc.latitude}" data-lon="${loc.longitude}">${loc.cityName}</option>
                            </c:forEach>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold small text-muted">Chọn địa phương 2:</label>
                        <select id="compareCity2" class="form-select">
                            <c:forEach var="loc" items="${locations}">
                                <option value="${loc.cityName}" data-lat="${loc.latitude}" data-lon="${loc.longitude}">${loc.cityName}</option>
                            </c:forEach>
                        </select>
                    </div>
                </div>

                <div id="compareResultContainer">
                    <!-- Render qua JS -->
                </div>
            </div>
            <div class="modal-footer border-0 pt-0">
                <button type="button" class="btn btn-glass-pill px-4" data-bs-dismiss="modal">Đóng</button>
            </div>
        </div>
    </div>
</div>
<!-- ================= ABOUT MODAL ================= -->
<div class="modal fade" id="infoModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modal-content-glass border-0">
            <div class="modal-header border-0 pb-0">
                <h5 class="modal-title fw-bold text-dark">
                    <i class="bi bi-info-circle text-primary me-2"></i>Thông Tin Đề Tài Bài Tập Nhóm
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body py-4">
                <h6 class="fw-bold text-dark mb-2">Học viện Công nghệ Bưu chính Viễn thông (PTIT)</h6>
                <p class="text-muted small mb-3">
                    <strong>Môn học:</strong> Lập Trình Web | <strong>Đề tài:</strong> Hệ thống tra cứu thời tiết tích
                    hợp Open-Meteo API &amp; Quản trị danh mục.
                </p>
                <ul class="list-unstyled small text-muted mb-0">
                    <li class="mb-2"><i class="bi bi-check2-circle text-success me-2"></i><strong>UI
                        Architecture:</strong> Next-Gen Apple Weather Bento Glassmorphism (Bright Daylight)
                    </li>
                    <li class="mb-2"><i class="bi bi-check2-circle text-success me-2"></i><strong>API Engine:</strong>
                        Open-Meteo REST API (WMO Weather Code, 7-Day &amp; 24-Hour Forecast)
                    </li>
                    <li class="mb-2"><i class="bi bi-check2-circle text-success me-2"></i><strong>Admin
                        Features:</strong> CRUD Địa phương, Tự động tìm toạ độ Geocoding, Xuất dữ liệu CSV
                    </li>
                    <li class="mb-2"><i class="bi bi-check2-circle text-success me-2"></i><strong>Cơ sở dữ
                        liệu:</strong> MySQL Server (weather_db: Admins, Regions &amp; Locations)
                    </li>
                </ul>
            </div>
            <div class="modal-footer border-0 pt-0">
                <button type="button" class="btn btn-glass-pill px-4" data-bs-dismiss="modal">Đóng</button>
            </div>
        </div>
    </div>
</div>

<!-- ================= FOOTER ================= -->
<footer class="footer-light py-4 mt-auto position-relative" style="z-index: 1;">
    <div class="container text-center text-md-between d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div class="mb-2 mb-md-0 text-muted small">
            &copy; 2026 <strong class="text-dark">VietWeather</strong> - Bài tập thực hành Lập trình Web PTIT
        </div>
        <div class="text-muted small">
            Dữ liệu theo cấu trúc <a href="https://open-meteo.com" target="_blank"
                                     class="text-decoration-none text-primary fw-semibold">Open-Meteo</a>
        </div>
    </div>
</footer>

<!-- Bootstrap JS Bundle -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<!-- Weather API & Simulation Module -->
<script src="${pageContext.request.contextPath}/static/js/weather-api.js"></script>
<!-- Main Home JS -->
<script src="static/js/main.js"></script>
</body>
</html>