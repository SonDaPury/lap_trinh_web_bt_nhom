/**
 * detail.js
 * Logic giao diện Trang chi tiết (detail.jsp)
 * Tích hợp chuẩn Tomcat 10, MySQL & Open-Meteo REST API
 */

let hourlyChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const locationId = urlParams.get("id") || "1";

  loadCityDetail(locationId);
  setupCityDropdown(locationId);
});

// Lấy Context Path động của ứng dụng
function getContextPath() {
  return window.location.pathname.substring(0, window.location.pathname.indexOf("/", 2)) || "";
}

// 1. Tải chi tiết thời tiết
async function loadCityDetail(id) {
  // Ưu tiên đọc thông tin toạ độ được render trực tiếp từ JSP (nếu có thẻ data-location)
  let loc = null;
  const serverLocationEl = document.getElementById("serverLocationData");

  if (serverLocationEl) {
    loc = {
      cityName: serverLocationEl.dataset.city,
      region: serverLocationEl.dataset.region,
      latitude: parseFloat(serverLocationEl.dataset.lat),
      longitude: parseFloat(serverLocationEl.dataset.lon)
    };
  } else if (typeof getLocationById === "function") {
    // Fallback sang hàm của weather-api.js nếu chạy client-side
    loc = getLocationById(id) || getLocationById(1);
  }

  if (!loc || isNaN(loc.latitude) || isNaN(loc.longitude)) return;

  document.title = `Thời Tiết ${loc.cityName} - VietWeather`;

  const breadcrumbEl = document.getElementById("breadcrumbCity");
  if (breadcrumbEl) breadcrumbEl.textContent = loc.cityName;

  const cityNameEl = document.getElementById("detailCityName");
  if (cityNameEl) cityNameEl.textContent = loc.cityName;

  const regionEl = document.getElementById("detailRegion");
  if (regionEl) regionEl.textContent = loc.region.startsWith("Miền") ? loc.region : `Miền ${loc.region}`;

  const coordsEl = document.getElementById("detailCoordinates");
  if (coordsEl) {
    coordsEl.innerHTML = `<i class="bi bi-compass me-1"></i>Toạ độ: ${loc.latitude.toFixed(4)}°B, ${loc.longitude.toFixed(4)}°Đ`;
  }

  const updateTimeEl = document.getElementById("detailUpdateTime");
  if (updateTimeEl) {
    updateTimeEl.textContent = `Cập nhật lúc: ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  }

  try {
    const weather = await fetchWeather(loc.latitude, loc.longitude, loc.cityName);
    const cur = weather.current;
    const daily = weather.daily;
    const hourly = weather.hourly;
    const wmo = getWMOInfo(cur.weather_code);

    // Cập nhật thẻ chính
    document.getElementById("detailTemp").textContent = `${Math.round(cur.temperature_2m)}°`;
    document.getElementById("detailFeelsLike").textContent = `${cur.apparent_temperature}°`;
    document.getElementById("detailCondition").textContent = wmo.label;
    document.getElementById("detailBigIcon").innerHTML = `<i class="bi ${wmo.icon}" style="color: ${wmo.color}; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.15));"></i>`;
    document.getElementById("detailMinMax").textContent = `${Math.round(daily.temperature_2m_min[0])}° / ${Math.round(daily.temperature_2m_max[0])}°C`;

    // Cập nhật 4 chỉ số khí tượng
    document.getElementById("metricHumidity").textContent = `${cur.relative_humidity_2m}%`;
    document.getElementById("metricWind").textContent = `${cur.wind_speed_10m} km/h`;
    document.getElementById("metricUV").textContent = `${daily.uv_index_max[0]}`;
    document.getElementById("metricPressure").textContent = `${Math.round(cur.surface_pressure)} hPa`;

    // Nhãn UV
    const uvVal = daily.uv_index_max[0];
    const uvStatusEl = document.getElementById("uvStatus");
    if (uvStatusEl) {
      if (uvVal >= 8) {
        uvStatusEl.innerHTML = `<span class="text-danger fw-bold">Rất cao - Tránh nắng</span>`;
      } else if (uvVal >= 5) {
        uvStatusEl.innerHTML = `<span class="text-warning fw-bold">Trung bình - Cần che chắn</span>`;
      } else {
        uvStatusEl.innerHTML = `<span class="text-success fw-bold">Mức an toàn</span>`;
      }
    }

    // Nhãn Độ ẩm
    const humStatusEl = document.getElementById("humidityStatus");
    if (humStatusEl) {
      if (cur.relative_humidity_2m > 80) {
        humStatusEl.textContent = "Độ ẩm cao, nồm ẩm";
      } else if (cur.relative_humidity_2m < 50) {
        humStatusEl.textContent = "Thời tiết hanh khô";
      } else {
        humStatusEl.textContent = "Mức độ thoải mái";
      }
    }

    // Vẽ biểu đồ 24 giờ
    renderHourlyChart(hourly);

    // Render danh sách 7 ngày
    render7DayForecast(daily);

    // Lời khuyên lối sống
    renderLifestyleAdvice(cur.weather_code, cur.temperature_2m, daily.uv_index_max[0]);
  } catch (err) {
    console.error("Lỗi khi tải dữ liệu thời tiết:", err);
  }
}

// 2. Vẽ biểu đồ nhiệt độ 24 giờ (Chart.js)
function renderHourlyChart(hourly) {
  const chartCanvas = document.getElementById("hourlyChart");
  if (!chartCanvas) return;
  const ctx = chartCanvas.getContext("2d");

  if (hourlyChartInstance) {
    hourlyChartInstance.destroy();
  }

  const labels = hourly.time.slice(0, 24).map(t => {
    const hour = new Date(t).getHours();
    return `${hour}:00`;
  });

  const temperatures = hourly.temperature_2m.slice(0, 24);

  const gradient = ctx.createLinearGradient(0, 0, 0, 250);
  gradient.addColorStop(0, "rgba(2, 132, 199, 0.28)");
  gradient.addColorStop(1, "rgba(2, 132, 199, 0.0)");

  hourlyChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Nhiệt độ (°C)",
        data: temperatures,
        borderColor: "#0284c7",
        backgroundColor: gradient,
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#0284c7",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: "#0284c7",
        pointHoverBorderColor: "#ffffff"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0f172a",
          padding: 12,
          titleFont: { size: 13, family: "Plus Jakarta Sans" },
          bodyFont: { size: 14, family: "Plus Jakarta Sans", weight: "bold" },
          callbacks: {
            label: function(context) {
              return ` Nhiệt độ: ${context.parsed.y}°C`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "Plus Jakarta Sans", size: 11 },
            color: "#64748b"
          }
        },
        y: {
          grid: { color: "#f1f5f9" },
          ticks: {
            callback: value => `${value}°`,
            font: { family: "Plus Jakarta Sans", size: 11 },
            color: "#64748b"
          }
        }
      }
    }
  });
}

// 3. Render 7 ngày tới
function render7DayForecast(daily) {
  const container = document.getElementById("sevenDayForecastList");
  if (!container) return;

  const weekdayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

  container.innerHTML = daily.time.map((timeStr, idx) => {
    const dateObj = new Date(timeStr);
    const dayName = idx === 0 ? "Hôm nay" : weekdayNames[dateObj.getDay()];
    const dateFormatted = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;
    const code = daily.weather_code[idx];
    const wmo = getWMOInfo(code);
    const maxT = Math.round(daily.temperature_2m_max[idx]);
    const minT = Math.round(daily.temperature_2m_min[idx]);

    const leftPercent = Math.max(0, Math.min(80, (minT - 15) * 3));
    const widthPercent = Math.max(25, Math.min(95 - leftPercent, (maxT - minT) * 7));

    return `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="forecast-bento-row">
          <div style="min-width: 85px;">
            <div class="fw-bold text-dark fs-6">${dayName}</div>
            <div class="text-muted small">${dateFormatted}</div>
          </div>

          <div class="d-flex align-items-center gap-2">
            <i class="bi ${wmo.icon} fs-4" style="color: ${wmo.color};"></i>
            <span class="small text-secondary d-none d-sm-inline" style="max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${wmo.label}</span>
          </div>

          <div class="d-flex align-items-center gap-2">
            <span class="small text-primary fw-semibold">${minT}°</span>
            <div class="forecast-range-bar-track d-none d-sm-block">
              <div class="forecast-range-bar-fill" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>
            </div>
            <span class="small text-danger fw-bold">${maxT}°</span>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// 4. Khuyến nghị thời tiết
function renderLifestyleAdvice(wmoCode, temp, uv) {
  const adviceEl = document.getElementById("lifestyleAdvice");
  if (!adviceEl) return;

  let advice = "";
  if (wmoCode >= 51 && wmoCode <= 82) {
    advice = "🌧️ <strong>Khả năng có mưa rào:</strong> Khuyến khích mang theo ô hoặc áo mưa dự phòng khi ra ngoài. Đường xá có thể trơn trượt vào giờ tan tầm.";
  } else if (temp >= 33) {
    advice = `☀️ <strong>Thời tiết nắng nóng (${temp}°C, UV: ${uv}):</strong> Hãy hạn chế tiếp xúc trực tiếp ánh nắng gắt vào giữa trưa, bổ sung đủ nước và bôi kem chống nắng khi hoạt động ngoài trời.`;
  } else if (temp <= 20) {
    advice = `🧣 <strong>Khí hậu se lạnh (${temp}°C):</strong> Nhiệt độ hạ thấp về chiều tối và đêm, hãy giữ ấm cổ và cơ thể bằng áo khoác nhẹ.`;
  } else {
    advice = "🌤️ <strong>Thời tiết thuận lợi:</strong> Điều kiện lý tưởng cho các hoạt động thể thao ngoài trời, học tập và làm việc. Chúc bạn có một ngày tràn đầy năng lượng!";
  }

  adviceEl.innerHTML = advice;
}

// 5. Dropdown chọn nhanh thành phố
function setupCityDropdown(currentId) {
  const container = document.getElementById("citySelectorDropdown");
  if (!container) return;

  const contextPath = getContextPath();
  const locations = (typeof getLocations === "function") ? getLocations() : [];

  if (locations.length === 0) return;

  const optionsHtml = locations.map(loc => {
    const locId = loc.id || loc.locationId;
    return `
      <li>
        <a class="dropdown-item ${locId == currentId ? 'active fw-bold' : ''}" href="${contextPath}/detail?id=${locId}">
          ${loc.cityName} (${loc.region ? 'Miền ' + loc.region : (loc.regionName || '')})
        </a>
      </li>
    `;
  }).join("");

  container.innerHTML = `
    <div class="dropdown">
      <button class="btn btn-glass-pill dropdown-toggle py-2 px-3 text-dark fw-semibold" type="button" data-bs-toggle="dropdown">
        <i class="bi bi-geo-alt text-primary me-1"></i> Chọn tỉnh thành khác
      </button>
      <ul class="dropdown-menu dropdown-menu-end shadow-sm border py-2" style="background: #ffffff; border-radius: 16px;">
        ${optionsHtml}
      </ul>
    </div>
  `;
}