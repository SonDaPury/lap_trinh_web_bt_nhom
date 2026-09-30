/**
 * admin.js
 * Logic Bảng điều khiển Quản trị (Tích hợp Java Servlet & MySQL)
 */

let deleteTargetId = null;
let locationModalInstance = null;
let deleteModalInstance = null;
let toastInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Khởi tạo Bootstrap Modals & Toast
  const locModalEl = document.getElementById("locationModal");
  if (locModalEl) locationModalInstance = new bootstrap.Modal(locModalEl);

  const delModalEl = document.getElementById("deleteConfirmModal");
  if (delModalEl) deleteModalInstance = new bootstrap.Modal(delModalEl);

  const toastEl = document.getElementById("adminToast");
  if (toastEl) toastInstance = new bootstrap.Toast(toastEl);

  // 2. Tìm kiếm và lọc trực tiếp trên các dòng <tr> của bảng (DOM Filter)
  document.getElementById("adminSearchInput")?.addEventListener("input", filterTableRows);
  document.getElementById("adminRegionFilter")?.addEventListener("change", filterTableRows);

  // 3. Sự kiện Xác nhận Xóa trong Modal
  document.getElementById("confirmDeleteBtn")?.addEventListener("click", () => {
    if (deleteTargetId) {
      const contextPath = getContextPath();
      window.location.href = `${contextPath}/admin/location?action=delete&id=${deleteTargetId}`;
    }
  });

  // 4. Sự kiện Tự động lấy toạ độ (Geocoding API)
  document.getElementById("autoGeocodeBtn")?.addEventListener("click", handleAutoGeocode);

  // 5. Sự kiện Xuất CSV từ bảng dữ liệu thực tế
  document.getElementById("exportCsvBtn")?.addEventListener("click", exportTableToCSV);
});

// Lấy Context Path động của ứng dụng
function getContextPath() {
  return window.location.pathname.substring(0, window.location.pathname.indexOf("/", 2)) || "";
}

// Lọc nhanh dữ liệu bảng mà không cần tải lại trang
function filterTableRows() {
  const searchVal = document.getElementById("adminSearchInput").value.trim().toLowerCase();
  const regionVal = document.getElementById("adminRegionFilter").value;
  const rows = document.querySelectorAll("#locationTableBody tr");
  let visibleCount = 0;

  rows.forEach(row => {
    const cityName = row.querySelector("td:nth-child(2)")?.textContent.toLowerCase() || "";
    const regionText = row.querySelector("td:nth-child(3)")?.textContent || "";

    const matchSearch = cityName.includes(searchVal);
    const matchRegion = (regionVal === "ALL") || regionText.includes(regionVal);

    if (matchSearch && matchRegion) {
      row.style.display = "";
      visibleCount++;
    } else {
      row.style.display = "none";
    }
  });

  const emptyAlert = document.getElementById("tableEmptyAlert");
  if (emptyAlert) {
    if (visibleCount === 0) {
      emptyAlert.classList.remove("d-none");
    } else {
      emptyAlert.classList.add("d-none");
    }
  }
}

// Mở Modal Thêm mới
function openAddModal() {
  document.getElementById("modalTitle").textContent = "Thêm địa phương mới";
  document.getElementById("locationId").value = "";
  document.getElementById("actionType").value = "create";
  document.getElementById("locationForm").reset();
  document.getElementById("geocodeHelperText").innerHTML = `
    <i class="bi bi-lightbulb text-warning me-1"></i> Bấm "Tự lấy toạ độ" để tự động điền kinh độ/vĩ độ chuẩn.
  `;
}

// Mở Modal Chỉnh sửa
function openEditModal(id, cityName, region, lat, lon, isFeatured) {
  document.getElementById("modalTitle").textContent = "Cập nhật địa phương";
  document.getElementById("locationId").value = id;
  document.getElementById("actionType").value = "update";
  document.getElementById("cityNameInput").value = cityName;

  // Chuẩn hóa tên vùng miền
  let cleanRegion = region.replace("Miền ", "").trim();
  document.getElementById("regionSelect").value = cleanRegion;

  document.getElementById("latitudeInput").value = lat;
  document.getElementById("longitudeInput").value = lon;
  document.getElementById("isFeaturedSwitch").checked = (isFeatured === true || isFeatured === "true");

  locationModalInstance.show();
}

// Mở Modal Xác nhận Xóa
function openDeleteModal(id, cityName) {
  deleteTargetId = id;
  document.getElementById("deleteModalCityText").textContent =
    `Bạn có chắc chắn muốn xóa địa phương "${cityName}" khỏi cơ sở dữ liệu?`;
  deleteModalInstance.show();
}

// Tự động tìm kiếm kinh độ / vĩ độ (Geocoding)
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
      document.getElementById("latitudeInput").value = Number(geo.latitude).toFixed(4);
      document.getElementById("longitudeInput").value = Number(geo.longitude).toFixed(4);
      if (geo.region) {
        document.getElementById("regionSelect").value = geo.region;
      }
      helperEl.innerHTML = `<span class="text-success"><i class="bi bi-check-circle-fill me-1"></i> Đã điền toạ độ: (${Number(geo.latitude).toFixed(4)}, ${Number(geo.longitude).toFixed(4)})</span>`;
    } else {
      helperEl.innerHTML = `<span class="text-warning"><i class="bi bi-exclamation-triangle-fill me-1"></i> Không tìm thấy toạ độ tự động. Bạn vui lòng nhập thủ công.</span>`;
    }
  } catch (err) {
    helperEl.innerHTML = `<span class="text-danger"><i class="bi bi-x-circle-fill me-1"></i> Lỗi kết nối dịch vụ toạ độ.</span>`;
  }
}

// Xuất file CSV trích xuất trực tiếp từ các hàng trong bảng
function exportTableToCSV() {
  const rows = document.querySelectorAll("#locationTableBody tr");
  if (rows.length === 0) {
    alert("Không có dữ liệu địa phương để xuất!");
    return;
  }

  const csvRows = [
    ["Mã ID", "Tỉnh / Thành phố", "Vùng miền", "Vĩ độ (Lat)", "Kinh độ (Long)", "Trang chủ"]
  ];

  rows.forEach(row => {
    const cols = row.querySelectorAll("td");
    if (cols.length >= 6) {
      csvRows.push([
        `"${cols[0].textContent.trim().replace('#', '')}"`,
        `"${cols[1].textContent.trim()}"`,
        `"${cols[2].textContent.trim()}"`,
        `"${cols[3].textContent.trim()}"`,
        `"${cols[4].textContent.trim()}"`,
        `"${cols[5].textContent.trim()}"`
      ]);
    }
  });

  const csvContent = "\uFEFF" + csvRows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `danh_sach_dia_phuong_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}