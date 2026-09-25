<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
  <%@ taglib prefix="c" uri="jakarta.tags.core" %>
    <% /* Nếu truy cập trực tiếp index.jsp mà chưa qua HomeController, tự động chuyển hướng */ if
      (request.getAttribute("isDbConnected")==null) { response.sendRedirect(request.getContextPath() + "/home" );
      return; } %>
      <!DOCTYPE html>
      <html lang="vi">

      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Location Weather App - Welcome</title>
        <!-- Bootstrap 5.3 CSS -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <!-- Bootstrap Icons -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
        <!-- Custom CSS -->
        <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/style.css">
      </head>

      <body class="bg-light">

        <!-- Navigation -->
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
          <div class="container">
            <a class="navbar-brand fw-bold" href="${pageContext.request.contextPath}/home">
              <i class="bi bi-cloud-sun-fill me-2"></i>Location Weather App
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                  <a class="nav-link active" href="${pageContext.request.contextPath}/home">Trang chủ</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <!-- Hero Section -->
        <div class="container py-5">
          <div class="row align-items-center g-5 py-4">
            <div class="col-lg-7">
              <h1 class="display-5 fw-bold lh-1 mb-3 text-dark">
                Hệ thống Quản lý Địa điểm & Thời tiết
              </h1>
              <p class="lead text-secondary">
                Dự án tra cứu thời tiết ở các khu vực
              </p>
              <div class=" d-grid gap-2 d-md-flex justify-content-md-start pt-3">
                <a href="${pageContext.request.contextPath}/home" class="btn btn-primary btn-lg px-4 me-md-2 shadow-sm">
                  <i class="bi bi-arrow-repeat me-1"></i> Làm mới trạng thái
                </a>
                <a href="https://open-meteo.com" target="_blank" class="btn btn-outline-secondary btn-lg px-4">
                  <i class="bi bi-box-arrow-up-right me-1"></i> Open-Meteo API
                </a>
              </div>
            </div>

            <div class="col-lg-5">
              <!-- Live System & Database Status Card -->
              <div class="card border-0 shadow-sm rounded-4 p-4 bg-white mb-3">
                <h5 class="fw-bold mb-3"><i class="bi bi-activity text-primary me-2"></i>Trạng thái Hệ thống & CSDL</h5>
                <ul class="list-group list-group-flush small">
                  <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span><i class="bi bi-database me-2"></i>Kết nối MySQL</span>
                    <c:choose>
                      <c:when test="${isDbConnected}">
                        <span class="badge bg-success-subtle text-success px-2 py-1"><i
                            class="bi bi-check-circle-fill me-1"></i> Đã kết nối thành công</span>
                      </c:when>
                      <c:otherwise>
                        <span class="badge bg-danger-subtle text-danger px-2 py-1"><i
                            class="bi bi-x-circle-fill me-1"></i> Chưa kết nối</span>
                      </c:otherwise>
                    </c:choose>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span><i class="bi bi-hdd-network me-2"></i>MySQL Target</span>
                    <span class="text-secondary fw-semibold">${dbHost}:${dbPort} / ${dbName}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span><i class="bi bi-file-code me-2"></i>Java Runtime</span>
                    <span class="text-secondary fw-semibold">JDK ${javaVersion}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span><i class="bi bi-server me-2"></i>Web Server</span>
                    <span class="text-secondary fw-semibold">${serverInfo}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span><i class="bi bi-clock me-2"></i>Server Time</span>
                    <span class="text-secondary">${currentTime}</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        <!-- Bootstrap 5.3 JS -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        <script src="${pageContext.request.contextPath}/static/js/app.js"></script>
      </body>

      </html>
