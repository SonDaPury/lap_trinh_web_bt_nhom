/**
 * main.js
 * Logic giao diện Trang chủ (home.jsp)
 * Tích hợp chuẩn Tomcat 10, MySQL & Open-Meteo REST API
 */

let currentFilterRegion = "ALL";
let currentSearchQuery = "";
let cachedWeatherList = [];

document.addEventListener("DOMContentLoaded", () => {
  initHeroClock();
  loadAllWeatherData();
  setupFilterEvents();
  setupSearchEvents();
  setupGeolocation();
  setupComparisonModal();
});

// Lấy Context Path động của ứng dụng
function getContextPath() {
  return window.location.pathname.substring(0, window.location.pathname.indexOf("/", 2)) || "";
}

// Lấy danh sách địa phương linh hoạt (Ưu tiên đọc từ JSP hoặc fallback sang weather-api.js)
function fetchActiveLocations() {
  // Kiểm tra nếu JSP có sẵn danh sách trong select modal so sánh
  const select1 = document.getElementById("compareCity1");
  if (select1 && select1.options.length > 0) {
    const list = [];
    for (let opt of select1.options) {
      if (opt.value && opt.dataset.lat && opt.dataset.lon) {
        list.push({
          id: opt.value,
          locationId: opt.value,
          cityName: opt.text.split(" (")[0],
          region: opt.dataset.region || "Bắc",
          regionName: opt.dataset.region || "Bắc",
          latitude: parseFloat(opt.dataset.lat),
          longitude: parseFloat(opt.dataset.lon),
          isFeatured: true
        });
      }
    }
    if (list.length > 0) return list;
  }

  // Fallback sang hàm của weather-api.js nếu chạy Client Store
  if (typeof getLocations === "function") {
    return getLocations();
  }
  return [];
}

// 1. Đồng hồ thời gian thực ở Hero Banner
function initHeroClock() {
  const timeEl = document.getElementById("heroTime");
  const dateEl = document.getElementById("heroDate");
  if (!timeEl || !dateEl) return;

  function update() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    dateEl.textContent = now.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }
  update();
  setInterval(update, 1000);
}

// 2. Tải dữ liệu các địa điểm & gọi API Open-Meteo
async function loadAllWeatherData() {
  const gridEl = document.getElementById("weatherGrid");
  const locations = fetchActiveLocations();

  updateRegionCounts(locations);

  gridEl.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted fw-semibold">Đang cập nhật dữ liệu khí tượng Open-Meteo...</p>
    </div>
  `;

  try {
    const promises = locations.map(async loc => {
      const weather = await fetchWeather(loc.latitude, loc.longitude, loc.cityName);
      return {
        location: loc,
        weather: weather
      };
    });

    cachedWeatherList = await Promise.all(promises);
    renderWeatherCards();
    checkExtremeWeatherAlerts();
    populateCompareDropdowns();
  } catch (err) {
    console.error("Lỗi khi tải dữ liệu thời tiết:", err);
    gridEl.innerHTML = `
      <div class="col-12">
        <div class="bento-card p-4 text-center text-danger">
          <i class="bi bi-exclamation-triangle-fill fs-3 me-2"></i> Không thể tải dữ liệu thời tiết Open-Meteo.
        </div>
      </div>
    `;
  }
}

// 3. Render các thẻ thời tiết ra Bento Grid (Bright Daylight Theme)
function renderWeatherCards() {
  const gridEl = document.getElementById("weatherGrid");
  const noResultsAlert = document.getElementById("noResultsAlert");
  const contextPath = getContextPath();

  const filtered = cachedWeatherList.filter(item => {
    const reg = (item.location.region || item.location.regionName || "").replace("Miền ", "");
    const matchRegion = currentFilterRegion === "ALL" || reg === currentFilterRegion;
    const matchSearch = item.location.cityName.toLowerCase().includes(currentSearchQuery.toLowerCase());
    return matchRegion && matchSearch;
  });

  if (filtered.length === 0) {
    gridEl.innerHTML = "";
    noResultsAlert.classList.remove("d-none");
    return;
  }

  noResultsAlert.classList.add("d-none");

  gridEl.innerHTML = filtered.map(item => {
    const loc = item.location;
    const cur = item.weather.current;
    const daily = item.weather.daily;
    const wmo = getWMOInfo(cur.weather_code);
    const locId = loc.id || loc.locationId;
    const reg = (loc.region || loc.regionName || "").replace("Miền ", "");

    let regionBadgeClass = "badge-region-bac";
    if (reg === "Trung") regionBadgeClass = "badge-region-trung";
    else if (reg === "Nam") regionBadgeClass = "badge-region-nam";

    const minT = Math.round(daily.temperature_2m_min[0]);
    const maxT = Math.round(daily.temperature_2m_max[0]);

    return `
      <div class="col-12 col-md-6 col-lg-4 animate-fade-in" id="card-city-${locId}">
        <div class="bento-card weather-city-card shadow-sm">
          <!-- Card Header: Region & Featured Tag -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="badge-region ${regionBadgeClass}">
              <i class="bi bi-geo-alt me-1"></i> Miền ${reg}
            </span>
            ${loc.isFeatured ? '<span class="badge rounded-pill px-2 py-1 small" style="background: #ffe4e6; color: #e11d48; border: 1px solid #fecdd3;"><i class="bi bi-star-fill me-1"></i> Tiêu biểu</span>' : ''}
          </div>

          <!-- City & Coordinates -->
          <div>
            <h3 class="city-title">${loc.cityName}</h3>
            <div class="text-muted small mb-3">
              <i class="bi bi-compass me-1"></i>${Number(loc.latitude).toFixed(2)}°B, ${Number(loc.longitude).toFixed(2)}°Đ
            </div>
          </div>

          <!-- Temperature & Aura Icon -->
          <div class="d-flex align-items-center justify-content-between my-2">
            <div>
              <div class="temp-display-giant text-dark">${Math.round(cur.temperature_2m)}°</div>
              <div class="fw-bold text-primary mt-1 fs-6">${wmo.label}</div>
              <div class="small text-muted mt-1">Biên độ: ${minT}° - ${maxT}°C</div>
            </div>
            <div class="weather-icon-aura" style="color: ${wmo.color};">
              <i class="bi ${wmo.icon}"></i>
            </div>
          </div>

          <!-- Weather Stats Chips: Humidity, Wind, Feels like -->
          <div class="row g-2 mt-auto pt-3">
            <div class="col-4">
              <div class="stat-chip">
                <i class="bi bi-droplet-fill text-info"></i>
                <span>${cur.relative_humidity_2m}%</span>
              </div>
            </div>
            <div class="col-4">
              <div class="stat-chip">
                <i class="bi bi-wind text-primary"></i>
                <span>${cur.wind_speed_10m}k/h</span>
              </div>
            </div>
            <div class="col-4">
              <div class="stat-chip">
                <i class="bi bi-thermometer-half text-danger"></i>
                <span>${cur.apparent_temperature}°</span>
              </div>
            </div>
          </div>

          <!-- Action Button: Detail -->
          <div class="mt-4 pt-2 border-top">
            <a href="${contextPath}/detail?id=${locId}" class="btn btn-glass-pill w-100 justify-content-center py-2 text-primary fw-bold text-decoration-none">
              Dự báo 7 ngày &amp; Biểu đồ <i class="bi bi-arrow-right ms-2"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// 4. Cập nhật số lượng đếm trên các Tab vùng miền
function updateRegionCounts(locations) {
  const countAll = locations.length;
  const countBac = locations.filter(l => (l.region || l.regionName || "").includes("Bắc")).length;
  const countTrung = locations.filter(l => (l.region || l.regionName || "").includes("Trung")).length;
  const countNam = locations.filter(l => (l.region || l.regionName || "").includes("Nam")).length;

  document.getElementById("countAll").textContent = countAll;
  document.getElementById("countBac").textContent = countBac;
  document.getElementById("countTrung").textContent = countTrung;
  document.getElementById("countNam").textContent = countNam;
}

// 5. Cài đặt sự kiện bấm nút Lọc vùng miền
function setupFilterEvents() {
  const filterBtns = document.querySelectorAll(".filter-pills .nav-link");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilterRegion = btn.getAttribute("data-region");
      renderWeatherCards();
    });
  });
}

// 6. Cài đặt sự kiện Tìm kiếm
function setupSearchEvents() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  function triggerSearch() {
    currentSearchQuery = searchInput.value.trim();
    renderWeatherCards();
  }

  if (searchInput) {
    searchInput.addEventListener("input", triggerSearch);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        triggerSearch();
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      triggerSearch();
    });
  }
}

// Quick Search Tag handler
window.quickSearch = function(cityName) {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.value = cityName;
    currentSearchQuery = cityName;
    renderWeatherCards();
  }
};

window.resetSearch = function() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.value = "";
    currentSearchQuery = "";
  }
  currentFilterRegion = "ALL";

  const filterBtns = document.querySelectorAll(".filter-pills .nav-link");
  filterBtns.forEach(b => b.classList.remove("active"));
  document.getElementById("filterAll")?.classList.add("active");

  renderWeatherCards();
};

// 7. HTML5 Geolocation (Nhận diện vị trí)
function setupGeolocation() {
  const btn = document.getElementById("geolocateBtn");
  if (!btn) return;

  async function handleGeolocate() {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị GPS!");
      return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1 text-primary"></span> Định vị...`;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        btn.innerHTML = originalText;
        alert(`📍 Đã định vị toạ độ GPS của bạn:\nVĩ độ: ${lat.toFixed(4)}, Kinh độ: ${lon.toFixed(4)}`);
        document.getElementById("searchInput").value = "Hà Nội";
        currentSearchQuery = "Hà Nội";
        renderWeatherCards();
      },
      (err) => {
        btn.innerHTML = originalText;
        alert("Không thể truy cập GPS hiện tại. Mặc định hiển thị dữ liệu thủ đô Hà Nội.");
        document.getElementById("searchInput").value = "Hà Nội";
        currentSearchQuery = "Hà Nội";
        renderWeatherCards();
      },
      { timeout: 5000 }
    );
  }

  btn.addEventListener("click", handleGeolocate);
}

// 8. Cảnh báo Thời tiết Cực đoan (WMO Code Alerts)
function checkExtremeWeatherAlerts() {
  const alertBanner = document.getElementById("extremeWeatherAlertBanner");
  const msgEl = document.getElementById("alertBannerMessage");
  if (!alertBanner || !msgEl) return;

  const severeItems = cachedWeatherList.filter(item => {
    const code = item.weather.current.weather_code;
    const temp = item.weather.current.temperature_2m;
    return code >= 80 || code === 95 || code === 96 || temp >= 35;
  });

  if (severeItems.length > 0) {
    const cityNames = severeItems.map(i => i.location.cityName).join(", ");
    msgEl.innerHTML = `Khu vực <strong>${cityNames}</strong> đang có thời tiết dông sét / mưa rào mạnh. Chú ý an toàn khi di chuyển ngoài trời.`;
    alertBanner.classList.remove("d-none");
  } else {
    alertBanner.classList.add("d-none");
  }
}

window.dismissAlertBanner = function() {
  document.getElementById("extremeWeatherAlertBanner")?.classList.add("d-none");
};

// 9. So Sánh Thời Tiết Giữa 2 Thành Phố
function setupComparisonModal() {
  const select1 = document.getElementById("compareCity1");
  const select2 = document.getElementById("compareCity2");

  if (select1 && select2) {
    select1.addEventListener("change", renderComparisonResult);
    select2.addEventListener("change", renderComparisonResult);
  }
}

function populateCompareDropdowns() {
  const select1 = document.getElementById("compareCity1");
  const select2 = document.getElementById("compareCity2");
  if (!select1 || !select2) return;

  const locations = cachedWeatherList.map(item => item.location);
  if (locations.length === 0) return;

  const optionsHtml = locations.map(l => {
    const id = l.id || l.locationId;
    const reg = (l.region || l.regionName || "").replace("Miền ", "");
    return `<option value="${id}">${l.cityName} (Miền ${reg})</option>`;
  }).join("");

  select1.innerHTML = optionsHtml;
  select2.innerHTML = optionsHtml;

  if (locations.length >= 2) {
    select1.value = locations[0].id || locations[0].locationId;
    select2.value = locations[1].id || locations[1].locationId;
  }
  renderComparisonResult();
}

function renderComparisonResult() {
  const container = document.getElementById("compareResultContainer");
  const val1 = document.getElementById("compareCity1")?.value;
  const val2 = document.getElementById("compareCity2")?.value;

  if (!container || !val1 || !val2) return;

  const item1 = cachedWeatherList.find(i => String(i.location.id || i.location.locationId) === String(val1));
  const item2 = cachedWeatherList.find(i => String(i.location.id || i.location.locationId) === String(val2));

  if (!item1 || !item2) return;

  const reg1 = (item1.location.region || item1.location.regionName || "").replace("Miền ", "");
  const reg2 = (item2.location.region || item2.location.regionName || "").replace("Miền ", "");

  const wmo1 = getWMOInfo(item1.weather.current.weather_code);
  const wmo2 = getWMOInfo(item2.weather.current.weather_code);

  const diffTemp = Math.round((item1.weather.current.temperature_2m - item2.weather.current.temperature_2m) * 10) / 10;
  let diffNotice = "";
  if (diffTemp > 0) {
    diffNotice = `<strong>${item1.location.cityName}</strong> ấm hơn <strong>${item2.location.cityName}</strong> khoảng ${Math.abs(diffTemp)}°C.`;
  } else if (diffTemp < 0) {
    diffNotice = `<strong>${item1.location.cityName}</strong> mát hơn <strong>${item2.location.cityName}</strong> khoảng ${Math.abs(diffTemp)}°C.`;
  } else {
    diffNotice = `Nhiệt độ giữa 2 địa phương hiện tại xấp xỉ nhau.`;
  }

  container.innerHTML = `
    <div class="table-responsive">
      <table class="table admin-table-light table-sm rounded-3 overflow-hidden text-center align-middle mb-3">
        <thead>
          <tr>
            <th class="text-start">Chỉ số khí hậu</th>
            <th class="text-primary fw-bold">${item1.location.cityName}</th>
            <th class="text-warning fw-bold">${item2.location.cityName}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-start text-secondary">Khu vực</td>
            <td><span class="badge-region badge-region-${reg1.toLowerCase()}">Miền ${reg1}</span></td>
            <td><span class="badge-region badge-region-${reg2.toLowerCase()}">Miền ${reg2}</span></td>
          </tr>
          <tr>
            <td class="text-start text-secondary">Nhiệt độ hiện tại</td>
            <td class="fw-bold fs-5 text-primary">${Math.round(item1.weather.current.temperature_2m)}°C</td>
            <td class="fw-bold fs-5 text-warning">${Math.round(item2.weather.current.temperature_2m)}°C</td>
          </tr>
          <tr>
            <td class="text-start text-secondary">Tình trạng thời tiết</td>
            <td><i class="bi ${wmo1.icon} me-1" style="color: ${wmo1.color}"></i>${wmo1.label}</td>
            <td><i class="bi ${wmo2.icon} me-1" style="color: ${wmo2.color}"></i>${wmo2.label}</td>
          </tr>
          <tr>
            <td class="text-start text-secondary">Độ ẩm không khí</td>
            <td>${item1.weather.current.relative_humidity_2m}%</td>
            <td>${item2.weather.current.relative_humidity_2m}%</td>
          </tr>
          <tr>
            <td class="text-start text-secondary">Tốc độ gió</td>
            <td>${item1.weather.current.wind_speed_10m} km/h</td>
            <td>${item2.weather.current.wind_speed_10m} km/h</td>
          </tr>
          <tr>
            <td class="text-start text-secondary">Biên độ ngày (Min/Max)</td>
            <td>${Math.round(item1.weather.daily.temperature_2m_min[0])}° - ${Math.round(item1.weather.daily.temperature_2m_max[0])}°C</td>
            <td>${Math.round(item2.weather.daily.temperature_2m_min[0])}° - ${Math.round(item2.weather.daily.temperature_2m_max[0])}°C</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="p-3 rounded-3 small" style="background: #e0f2fe; border: 1px solid #bae6fd; color: #0369a1;">
      <i class="bi bi-info-circle-fill me-1"></i> ${diffNotice}
    </div>
  `;
}