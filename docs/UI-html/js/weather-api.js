/**
 * weather-api.js
 * Quản lý & Mô phỏng dữ liệu chuẩn Open-Meteo REST API
 * Hỗ trợ bài tập lớn Lập trình Web - Học viện Công nghệ Bưu chính Viễn thông (PTIT)
 */

// Chế độ mô phỏng dữ liệu Open-Meteo (True: Chạy offline mượt mà với mock data chuẩn Open-Meteo)
const SIMULATE_OPEN_METEO = true;

// Bảng giải mã mã thời tiết WMO (World Meteorological Organization) sang Tiếng Việt & Icon Bootstrap
const WMO_CODES = {
  0: { label: "Trời quang đãng", icon: "bi-sun-fill", type: "clear", color: "#f59e0b" },
  1: { label: "Ít mây", icon: "bi-cloud-sun-fill", type: "partly-cloudy", color: "#f59e0b" },
  2: { label: "Mây rải rác", icon: "bi-cloud-sun", type: "partly-cloudy", color: "#0ea5e9" },
  3: { label: "Nhiều mây u ám", icon: "bi-clouds-fill", type: "cloudy", color: "#64748b" },
  45: { label: "Có sương mù", icon: "bi-cloud-fog2-fill", type: "fog", color: "#94a3b8" },
  48: { label: "Sương mù đóng băng", icon: "bi-cloud-fog-fill", type: "fog", color: "#94a3b8" },
  51: { label: "Mưa phùn nhẹ", icon: "bi-cloud-drizzle", type: "rain", color: "#38bdf8" },
  53: { label: "Mưa phùn vừa", icon: "bi-cloud-drizzle-fill", type: "rain", color: "#0ea5e9" },
  55: { label: "Mưa phùn dày hạt", icon: "bi-cloud-rain-heavy", type: "rain", color: "#0284c7" },
  61: { label: "Mưa rào nhẹ", icon: "bi-cloud-rain", type: "rain", color: "#38bdf8" },
  63: { label: "Mưa rào vừa", icon: "bi-cloud-rain-fill", type: "rain", color: "#0284c7" },
  65: { label: "Mưa to dữ dội", icon: "bi-cloud-rain-heavy-fill", type: "heavy-rain", color: "#1d4ed8" },
  71: { label: "Tuyết rơi nhẹ", icon: "bi-snow", type: "snow", color: "#cbd5e1" },
  80: { label: "Mưa rào ngắt quãng", icon: "bi-cloud-rain", type: "rain", color: "#38bdf8" },
  81: { label: "Mưa rào từng cơn", icon: "bi-cloud-rain-fill", type: "rain", color: "#0284c7" },
  82: { label: "Mưa rào rất to", icon: "bi-cloud-rain-heavy-fill", type: "heavy-rain", color: "#1e3a8a" },
  95: { label: "Có dông sét", icon: "bi-cloud-lightning-rain-fill", type: "thunder", color: "#8b5cf6" },
  96: { label: "Dông kèm mưa đá nhỏ", icon: "bi-cloud-lightning-fill", type: "thunder", color: "#7c3aed" }
};

function getWMOInfo(code) {
  return WMO_CODES[code] || { label: "Có mây thay đổi", icon: "bi-cloud-fill", type: "cloudy", color: "#0ea5e9" };
}

// Bảng dữ liệu mẫu ban đầu khớp CSDL SQL Server (CREATE TABLE Locations)
const DEFAULT_LOCATIONS = [
  { id: 1, cityName: "Hà Nội", region: "Bắc", latitude: 21.0285, longitude: 105.8542, isFeatured: true },
  { id: 2, cityName: "TP. Hồ Chí Minh", region: "Nam", latitude: 10.8231, longitude: 106.6297, isFeatured: true },
  { id: 3, cityName: "Đà Nẵng", region: "Trung", latitude: 16.0544, longitude: 108.2022, isFeatured: true },
  { id: 4, cityName: "Hải Phòng", region: "Bắc", latitude: 20.8449, longitude: 106.6881, isFeatured: true },
  { id: 5, cityName: "Cần Thơ", region: "Nam", latitude: 10.0452, longitude: 105.7469, isFeatured: true },
  { id: 6, cityName: "Huế", region: "Trung", latitude: 16.4637, longitude: 107.5909, isFeatured: true },
  { id: 7, cityName: "Đà Lạt", region: "Trung", latitude: 11.9404, longitude: 108.4583, isFeatured: true },
  { id: 8, cityName: "Nha Trang", region: "Trung", latitude: 12.2388, longitude: 109.1967, isFeatured: false },
  { id: 9, cityName: "Sa Pa", region: "Bắc", latitude: 22.3364, longitude: 103.8438, isFeatured: false }
];

const STORAGE_KEY = "vietweather_locations";
const ADMIN_STORAGE_KEY = "vietweather_admin_user";

// Helper lấy danh sách Locations
function getLocations() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LOCATIONS));
    return DEFAULT_LOCATIONS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_LOCATIONS;
  }
}

// Lưu danh sách Locations
function saveLocations(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Lấy 1 địa điểm theo ID
function getLocationById(id) {
  const list = getLocations();
  return list.find(item => item.id === parseInt(id));
}

// Thêm địa điểm mới (CRUD - C)
function addLocation(location) {
  const list = getLocations();
  const maxId = list.reduce((max, cur) => (cur.id > max ? cur.id : max), 0);
  const newLocation = {
    id: maxId + 1,
    cityName: location.cityName.trim(),
    region: location.region,
    latitude: parseFloat(location.latitude),
    longitude: parseFloat(location.longitude),
    isFeatured: Boolean(location.isFeatured)
  };
  list.push(newLocation);
  saveLocations(list);
  return newLocation;
}

// Cập nhật địa điểm (CRUD - U)
function updateLocation(id, updatedData) {
  const list = getLocations();
  const index = list.findIndex(item => item.id === parseInt(id));
  if (index !== -1) {
    list[index] = {
      ...list[index],
      cityName: updatedData.cityName.trim(),
      region: updatedData.region,
      latitude: parseFloat(updatedData.latitude),
      longitude: parseFloat(updatedData.longitude),
      isFeatured: Boolean(updatedData.isFeatured)
    };
    saveLocations(list);
    return list[index];
  }
  return null;
}

// Xóa địa điểm (CRUD - D)
function deleteLocation(id) {
  let list = getLocations();
  list = list.filter(item => item.id !== parseInt(id));
  saveLocations(list);
}

// Khôi phục danh sách mặc định
function resetDefaultLocations() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LOCATIONS));
  return DEFAULT_LOCATIONS;
}

// ========================================================
// HÀM MÔ PHỎNG DỮ LIỆU CHUẨN OPEN-METEO API JSON FORMAT
// ========================================================

/**
 * Tạo mock response hoàn toàn khớp với JSON schema của Open-Meteo:
 * - current: thông số thời gian thực
 * - hourly: dự báo 24 giờ tiếp theo (cho Chart.js)
 * - daily: dự báo 7 ngày tới
 */
function generateSimulatedOpenMeteoData(cityName, lat, lon) {
  // Xác định hồ sơ khí hậu đặc trưng theo địa phương
  let baseTemp = 29.0;
  let baseCode = 1; // 1: Ít mây
  let humidity = 70;
  let windSpeed = 12.0;

  const nameLower = (cityName || "").toLowerCase();
  if (nameLower.includes("sa pa") || nameLower.includes("sapa")) {
    baseTemp = 18.5;
    baseCode = 45; // Sương mù
    humidity = 88;
    windSpeed = 8.5;
  } else if (nameLower.includes("đà lạt") || nameLower.includes("da lat")) {
    baseTemp = 20.0;
    baseCode = 2; // Mây rải rác
    humidity = 82;
    windSpeed = 9.0;
  } else if (nameLower.includes("hà nội") || nameLower.includes("ha noi")) {
    baseTemp = 29.5;
    baseCode = 1; // Nắng dịu / ít mây
    humidity = 68;
    windSpeed = 11.5;
  } else if (nameLower.includes("hồ chí minh") || nameLower.includes("ho chi minh") || nameLower.includes("sài gòn")) {
    baseTemp = 32.5;
    baseCode = 61; // Chiều mưa rào nhẹ
    humidity = 76;
    windSpeed = 14.0;
  } else if (nameLower.includes("đà nẵng") || nameLower.includes("da nang") || nameLower.includes("nha trang")) {
    baseTemp = 31.0;
    baseCode = 0; // Nắng biển
    humidity = 65;
    windSpeed = 16.5;
  }

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // 1. Mô phỏng 24 giờ (Hourly)
  const hourlyTime = [];
  const hourlyTemp = [];
  const hourlyCode = [];
  for (let h = 0; h < 24; h++) {
    const timeLabel = `${todayStr}T${h.toString().padStart(2, '0')}:00`;
    hourlyTime.push(timeLabel);
    
    // Nhiệt độ dao động theo đường cong hình sin ngày đêm
    const hourFactor = Math.sin(((h - 8) / 24) * 2 * Math.PI);
    const tempAtHour = Math.round((baseTemp + hourFactor * 3.5) * 10) / 10;
    hourlyTemp.push(tempAtHour);

    let codeAtHour = baseCode;
    if (h >= 13 && h <= 16 && (nameLower.includes("hồ chí minh") || nameLower.includes("cần thơ"))) {
      codeAtHour = 61; // Mưa rào chiều nhiệt đới
    }
    hourlyCode.push(codeAtHour);
  }

  // 2. Mô phỏng 7 ngày (Daily)
  const dailyTime = [];
  const dailyCode = [];
  const dailyTempMax = [];
  const dailyTempMin = [];
  const dailySunrise = [];
  const dailySunset = [];
  const dailyUv = [];

  const daysOfWeekVariation = [0, 1, 2, 61, 1, 0, 2];

  for (let d = 0; d < 7; d++) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + d);
    const dStr = targetDate.toISOString().split("T")[0];
    
    dailyTime.push(dStr);
    dailySunrise.push(`${dStr}T05:48`);
    dailySunset.push(`${dStr}T17:55`);

    const dayVar = (d % 3) - 1; // -1, 0, 1
    dailyTempMax.push(Math.round((baseTemp + 3.0 + dayVar) * 10) / 10);
    dailyTempMin.push(Math.round((baseTemp - 4.5 + dayVar * 0.5) * 10) / 10);
    dailyCode.push(d === 0 ? baseCode : daysOfWeekVariation[(d + Math.floor(lat)) % daysOfWeekVariation.length]);
    dailyUv.push(Math.round((6.5 + (d % 3) * 0.8) * 10) / 10);
  }

  // Cấu trúc chuẩn Open-Meteo Forecast Response
  return {
    latitude: lat,
    longitude: lon,
    generationtime_ms: 0.28,
    utc_offset_seconds: 25200,
    timezone: "Asia/Bangkok",
    timezone_abbreviation: "+07",
    elevation: 15.0,
    current: {
      time: now.toISOString(),
      interval: 900,
      temperature_2m: baseTemp,
      relative_humidity_2m: humidity,
      apparent_temperature: Math.round((baseTemp + 2.2) * 10) / 10,
      weather_code: baseCode,
      surface_pressure: 1012.4,
      wind_speed_10m: windSpeed,
      wind_direction_10m: 135
    },
    hourly: {
      time: hourlyTime,
      temperature_2m: hourlyTemp,
      weather_code: hourlyCode
    },
    daily: {
      time: dailyTime,
      weather_code: dailyCode,
      temperature_2m_max: dailyTempMax,
      temperature_2m_min: dailyTempMin,
      sunrise: dailySunrise,
      sunset: dailySunset,
      uv_index_max: dailyUv
    }
  };
}

/**
 * Hàm lấy dữ liệu thời tiết:
 * Nếu SIMULATE_OPEN_METEO = true => trả về mock Open-Meteo data chuẩn
 * Nếu SIMULATE_OPEN_METEO = false => gọi trực tiếp REST API của Open-Meteo
 */
async function fetchWeather(lat, lon, cityName = "") {
  if (SIMULATE_OPEN_METEO) {
    // Tạo độ trễ mạng nhẹ (150ms) mô phỏng cảm giác gọi REST API chân thực
    await new Promise(res => setTimeout(res, 120));
    return generateSimulatedOpenMeteoData(cityName, lat, lon);
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&hourly=temperature_2m,weather_code&timezone=Asia%2FBangkok`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("API call error");
    return await response.json();
  } catch (error) {
    console.warn("Chuyển sang dữ liệu mô phỏng do lỗi kết nối:", error);
    return generateSimulatedOpenMeteoData(cityName, lat, lon);
  }
}

/**
 * Mô phỏng Geocoding API (Tự động điền toạ độ khi nhập tên tỉnh thành)
 */
const VIETNAM_GEO_DATABASE = {
  "hà nội": { lat: 21.0285, lon: 105.8542, region: "Bắc" },
  "hải phòng": { lat: 20.8449, lon: 106.6881, region: "Bắc" },
  "quảng ninh": { lat: 20.9505, lon: 107.0734, region: "Bắc" },
  "sa pa": { lat: 22.3364, lon: 103.8438, region: "Bắc" },
  "lào cai": { lat: 22.4856, lon: 103.9707, region: "Bắc" },
  "ninh bình": { lat: 20.2506, lon: 105.9745, region: "Bắc" },
  "đà nẵng": { lat: 16.0544, lon: 108.2022, region: "Trung" },
  "huế": { lat: 16.4637, lon: 107.5909, region: "Trung" },
  "đà lạt": { lat: 11.9404, lon: 108.4583, region: "Trung" },
  "nha trang": { lat: 12.2388, lon: 109.1967, region: "Trung" },
  "quảng bình": { lat: 17.4690, lon: 106.6223, region: "Trung" },
  "quy nhơn": { lat: 13.7820, lon: 109.2197, region: "Trung" },
  "hồ chí minh": { lat: 10.8231, lon: 106.6297, region: "Nam" },
  "sài gòn": { lat: 10.8231, lon: 106.6297, region: "Nam" },
  "cần thơ": { lat: 10.0452, lon: 105.7469, region: "Nam" },
  "vũng tàu": { lat: 10.3460, lon: 107.0843, region: "Nam" },
  "phú quốc": { lat: 10.2899, lon: 103.9840, region: "Nam" },
  "an giang": { lat: 10.3759, lon: 105.4185, region: "Nam" }
};

async function searchGeocoding(cityName) {
  if (!cityName) return [];
  const query = cityName.trim().toLowerCase();
  
  // Tìm trong cơ sở dữ liệu mẫu mô phỏng trước
  for (const [key, val] of Object.entries(VIETNAM_GEO_DATABASE)) {
    if (query.includes(key) || key.includes(query)) {
      return [{
        name: cityName,
        latitude: val.lat,
        longitude: val.lon,
        region: val.region,
        country: "Việt Nam"
      }];
    }
  }

  // Tọa độ ngẫu nhiên trong phạm vi Việt Nam nếu không tìm thấy chính xác
  return [{
    name: cityName,
    latitude: 16.0 + (Math.random() * 4 - 2),
    longitude: 106.0 + (Math.random() * 4 - 2),
    region: "Trung",
    country: "Việt Nam"
  }];
}

// Quản trị viên (Session Authentication mô phỏng)
function checkAdminAuth() {
  const admin = localStorage.getItem(ADMIN_STORAGE_KEY);
  return admin ? JSON.parse(admin) : null;
}

function loginAdmin(username, password) {
  // Khớp với bảng Admins trong CSDL docx (username: admin / password: 123456)
  if (username === "admin" && password === "123456") {
    const adminData = {
      admin_id: 1,
      username: "admin",
      full_name: "Quản Trị Viên (Admin)",
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminData));
    return { success: true, admin: adminData };
  }
  return { success: false, message: "Tên đăng nhập hoặc mật khẩu không đúng! (Mặc định: admin / 123456)" };
}

function logoutAdmin() {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
  window.location.href = "login.html";
}
async function fetchAirQuality(lat, lon) {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm10,pm2_5`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Lỗi khi tải dữ liệu AQI");
  return await res.json();
}

function getAQILevel(aqi) {
  if (aqi <= 20) {
    return { label: "Rất tốt", class: "text-success", bg: "bg-success-subtle", desc: "Không khí trong lành, rất an toàn." };
  } else if (aqi <= 40) {
    return { label: "Tốt", class: "text-info", bg: "bg-info-subtle", desc: "Chất lượng không khí ở mức chấp nhận được." };
  } else if (aqi <= 60) {
    return { label: "Trung bình", class: "text-warning", bg: "bg-warning-subtle", desc: "Nhóm nhạy cảm nên hạn chế ở ngoài lâu." };
  } else if (aqi <= 80) {
    return { label: "Kém", class: "text-danger", bg: "bg-danger-subtle", desc: "Nên đeo khẩu trang chống bụi khi ra đường." };
  } else {
    return { label: "Rất nguy hại", class: "text-danger fw-bold", bg: "bg-danger text-white", desc: "Cảnh báo khẩn cấp: Tránh vận động ngoài trời." };
  }
}