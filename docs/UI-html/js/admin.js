/**
 * admin.js
 * Logic Bảng điều khiển Quản trị (admin.html)
 * Đáp ứng Use Case UC04 (CRUD Locations) và UC05 (Thống kê đơn giản)
 */

let deleteTargetId = null;
let locationModalInstance = null;
let deleteModalInstance = null;
let toastInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Kiểm tra xác thực Admin Session (UC03)
  const currentAdmin = checkAdminAuth();
  if (!currentAdmin) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("adminNameDisplay").textContent = currentAdmin.full_name || "Quản Trị Viên";

  // Khởi tạo Bootstrap Modals & Toast
  locationModalInstance = new bootstrap.Modal(document.getElementById("locationModal"));
  deleteModalInstance = new bootstrap.Modal(document.getElementById("deleteConfirmModal"));
  toastInstance = new bootstrap.Toast(document.getElementById("adminToast"));

  // Đăng xuất
  document.getElementById("logoutBtn").addEventListener("click", () => {
    logoutAdmin();
  });

  // Tải dữ liệu ban đầu
  renderDashboard();

  // Sự kiện tìm kiếm & lọc
  document.getElementById("adminSearchInput").addEventListener("input", renderTable);
  document.getElementById("adminRegionFilter").addEventListener("change", renderTable);

  // Sự kiện Form Thêm/Sửa
  document.getElementById("locationForm").addEventListener("submit", handleSaveLocation);

  // Sự kiện Xóa
  document.getElementById("confirmDeleteBtn").addEventListener("click", handleConfirmDelete);

  // Sự kiện Tự động lấy toạ độ (Geocoding API)
  document.getElementById("autoGeocodeBtn").addEventListener("click", handleAutoGeocode);

  // Sự kiện Xuất file CSV / Excel
  document.getElementById("exportCsvBtn").addEventListener("click", exportToCSV);

  // Sự kiện Khôi phục dữ liệu mẫu
  document.getElementById("resetDataBtn").addEventListener("click", () => {
    if (confirm("Khôi phục danh sách về 9 địa phương mẫu ban đầu?")) {
      resetDefaultLocations();
      renderDashboard();
      showToast("Đã khôi phục danh mục mẫu ban đầu!");
    }
  });
});

// 2. Render toàn bộ Dashboard (KPI + Table)
function renderDashboard() {
  updateKPIStatistics();
  renderTable();
}

// 3. Thống kê số lượng địa phương theo vùng miền (UC05)
function updateKPIStatistics() {
  const locations = getLocations();
  const total = locations.length;
  const bac = locations.filter(l => l.region === "Bắc").length;
  const trung = locations.filter(l => l.region === "Trung").length;
  const nam = locations.filter(l => l.region === "Nam").length;

  document.getElementById("statTotalLocations").textContent = total;
  document.getElementById("statBac").textContent = bac;
  document.getElementById("statTrung").textContent = trung;
  document.getElementById("statNam").textContent = nam;
}

// 4. Render Bảng danh sách địa phương (CRUD - Read)
function renderTable() {
  const tbody = document.getElementById("locationTableBody");
  const emptyAlert = document.getElementById("tableEmptyAlert");
  const searchVal = document.getElementById("adminSearchInput").value.trim().toLowerCase();
  const regionVal = document.getElementById("adminRegionFilter").value;

  const locations = getLocations();

  const filtered = locations.filter(loc => {
    const matchSearch = loc.cityName.toLowerCase().includes(searchVal);
    const matchRegion = regionVal === "ALL" || loc.region === regionVal;
    return matchSearch && matchRegion;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = "";
    emptyAlert.classList.remove("d-none");
    return;
  }

  emptyAlert.classList.add("d-none");

  tbody.innerHTML = filtered.map(loc => {
    let regionBadgeClass = "badge-region-bac";
    if (loc.region === "Trung") regionBadgeClass = "badge-region-trung";
    else if (loc.region === "Nam") regionBadgeClass = "badge-region-nam";

    return `
      <tr>
        <td class="fw-bold text-muted">#${loc.id}</td>
        <td>
          <div class="fw-bold text-dark fs-6">${loc.cityName}</div>
        </td>
        <td>
          <span class="badge-region ${regionBadgeClass}">
            Miền ${loc.region}
          </span>
        </td>
        <td><code class="text-primary bg-light px-2 py-1 rounded">${loc.latitude.toFixed(4)}</code></td>
        <td><code class="text-primary bg-light px-2 py-1 rounded">${loc.longitude.toFixed(4)}</code></td>
        <td class="text-center">
          <div class="form-check form-switch d-inline-block">
            <input class="form-check-input" type="checkbox" role="switch" 
                   ${loc.isFeatured ? 'checked' : ''} 
                   onchange="handleToggleFeatured(${loc.id}, this.checked)"
                   title="Bật/Tắt hiển thị ở trang chủ">
          </div>
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 me-1" onclick="openEditModal(${loc.id})" title="Chỉnh sửa">
            <i class="bi bi-pencil-square me-1"></i> Sửa
          </button>
          <button class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1" onclick="openDeleteModal(${loc.id}, '${loc.cityName}')" title="Xóa">
            <i class="bi bi-trash3 me-1"></i> Xóa
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// 5. Mở Modal Thêm mới
window.openAddModal = function() {
  document.getElementById("locationForm").reset();
  document.getElementById("locationId").value = "";
  document.getElementById("modalTitle").textContent = "Thêm địa phương mới";
  document.getElementById("isFeaturedSwitch").checked = true;
  document.getElementById("geocodeHelperText").innerHTML = `<i class="bi bi-lightbulb text-warning me-1"></i> Bấm "Tự lấy toạ độ" để tự động điền kinh độ/vĩ độ theo Open-Meteo Geocoding.`;
};

// 6. Mở Modal Chỉnh sửa
window.openEditModal = function(id) {
  const loc = getLocationById(id);
  if (!loc) return;

  document.getElementById("locationId").value = loc.id;
  document.getElementById("cityNameInput").value = loc.cityName;
  document.getElementById("regionSelect").value = loc.region;
  document.getElementById("latitudeInput").value = loc.latitude;
  document.getElementById("longitudeInput").value = loc.longitude;
  document.getElementById("isFeaturedSwitch").checked = loc.isFeatured;

  document.getElementById("modalTitle").textContent = `Chỉnh sửa: ${loc.cityName}`;
  locationModalInstance.show();
};

// 7. Xử lý Lưu Form Thêm/Sửa (CRUD - Create & Update)
function handleSaveLocation(e) {
  e.preventDefault();

  const id = document.getElementById("locationId").value;
  const cityName = document.getElementById("cityNameInput").value.trim();
  const region = document.getElementById("regionSelect").value;
  const latitude = parseFloat(document.getElementById("latitudeInput").value);
  const longitude = parseFloat(document.getElementById("longitudeInput").value);
  const isFeatured = document.getElementById("isFeaturedSwitch").checked;

  if (!cityName || isNaN(latitude) || isNaN(longitude)) {
    alert("Vui lòng điền đầy đủ và chính xác các thông tin!");
    return;
  }

  if (id) {
    // Cập nhật
    updateLocation(id, { cityName, region, latitude, longitude, isFeatured });
    showToast(`Đã cập nhật thông tin "${cityName}" thành công!`);
  } else {
    // Thêm mới
    addLocation({ cityName, region, latitude, longitude, isFeatured });
    showToast(`Đã thêm mới địa phương "${cityName}" thành công!`);
  }

  locationModalInstance.hide();
  renderDashboard();
}

// 8. Bật/Tắt trạng thái Nổi bật trang chủ
window.handleToggleFeatured = function(id, isFeatured) {
  const loc = getLocationById(id);
  if (loc) {
    updateLocation(id, { ...loc, isFeatured });
    showToast(`Đã ${isFeatured ? 'bật' : 'tắt'} hiển thị trang chủ cho "${loc.cityName}"`);
  }
};

// 9. Mở Modal Xóa (CRUD - Delete)
window.openDeleteModal = function(id, cityName) {
  deleteTargetId = id;
  document.getElementById("deleteModalCityText").textContent = `Bạn có chắc chắn muốn xóa "${cityName}" khỏi danh sách theo dõi?`;
  deleteModalInstance.show();
};

// 10. Xác nhận Xóa
function handleConfirmDelete() {
  if (deleteTargetId !== null) {
    deleteLocation(deleteTargetId);
    deleteModalInstance.hide();
    deleteTargetId = null;
    renderDashboard();
    showToast("Đã xóa địa phương thành công!", "danger");
  }
}

// 11. Tính năng nâng cao: Tự động tra cứu toạ độ bằng Geocoding
async function handleAutoGeocode() {
  const cityName = document.getElementById("cityNameInput").value.trim();
  const helperEl = document.getElementById("geocodeHelperText");

  if (!cityName) {
    alert("Vui lòng nhập tên Tỉnh / Thành phố trước khi lấy toạ độ!");
    return;
  }

  helperEl.innerHTML = `<span class="spinner-border spinner-border-sm text-primary me-1"></span> Đang dò tìm toạ độ qua API...`;

  try {
    const results = await searchGeocoding(cityName);
    if (results && results.length > 0) {
      const geo = results[0];
      document.getElementById("latitudeInput").value = geo.latitude.toFixed(4);
      document.getElementById("longitudeInput").value = geo.longitude.toFixed(4);
      if (geo.region) {
        document.getElementById("regionSelect").value = geo.region;
      }
      helperEl.innerHTML = `<span class="text-success"><i class="bi bi-check-circle-fill me-1"></i> Đã tự động điền toạ độ chuẩn cho "${cityName}" (${geo.latitude.toFixed(4)}, ${geo.longitude.toFixed(4)})</span>`;
    } else {
      helperEl.innerHTML = `<span class="text-warning"><i class="bi bi-exclamation-triangle-fill me-1"></i> Không tìm thấy toạ độ tự động. Bạn vui lòng nhập thủ công.</span>`;
    }
  } catch (err) {
    helperEl.innerHTML = `<span class="text-danger"><i class="bi bi-x-circle-fill me-1"></i> Lỗi kết nối dịch vụ toạ độ.</span>`;
  }
}

// 12. Hiển thị thông báo Toast
function showToast(message, type = "success") {
  const toastEl = document.getElementById("adminToast");
  const msgEl = document.getElementById("toastMessage");
  
  toastEl.className = `toast align-items-center text-bg-${type} border-0 rounded-3 shadow`;
  msgEl.textContent = message;
  toastInstance.show();
}

// 13. TÍNH NĂNG ĐIỂM CỘNG 4: Xuất dữ liệu danh sách địa phương ra file CSV/Excel
function exportToCSV() {
  const locations = getLocations();
  if (locations.length === 0) {
    alert("Không có dữ liệu địa phương nào để xuất!");
    return;
  }

  // Header CSV
  const headers = ["Mã ID", "Tên Tỉnh / Thành Phố", "Vùng Miền", "Vĩ Độ (Latitude)", "Kinh Độ (Longitude)", "Nổi Bật Trang Chủ"];
  
  const rows = locations.map(l => [
    l.id,
    `"${l.cityName}"`,
    `"${l.region}"`,
    l.latitude,
    l.longitude,
    l.isFeatured ? "Có" : "Không"
  ]);

  // \uFEFF là Byte Order Mark (BOM) giúp Microsoft Excel mở file tiếng Việt không bị lỗi font UTF-8
  let csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `danh_sach_dia_diem_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("Đã tải xuống file CSV danh mục địa phương!");
}

