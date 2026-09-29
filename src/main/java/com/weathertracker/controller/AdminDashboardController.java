package com.weathertracker.controller;

import com.weathertracker.dao.AdminDAO;
import com.weathertracker.dao.LocationDAO;
import com.weathertracker.model.Location;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.List;

@WebServlet(name = "AdminDashboardController", urlPatterns = {"/admin/dashboard", "/admin"})
public class AdminDashboardController extends HttpServlet {

    private AdminDAO adminDAO;
    private LocationDAO locationDAO;

    @Override
    public void init() throws ServletException {
        adminDAO = new AdminDAO();
        locationDAO = new LocationDAO();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("adminUser") == null) {
            response.sendRedirect(request.getContextPath() + "/admin/login");
            return;
        }

        // Tính toán các chỉ số KPI
        int total = adminDAO.countLocationsByRegion("ALL");
        int bac = adminDAO.countLocationsByRegion("Bắc");
        int trung = adminDAO.countLocationsByRegion("Trung");
        int nam = adminDAO.countLocationsByRegion("Nam");

        // Lấy danh sách địa phương cho bảng CRUD
        List<Location> locations = locationDAO.getAllLocations();

        request.setAttribute("totalLocations", total);
        request.setAttribute("countBac", bac);
        request.setAttribute("countTrung", trung);
        request.setAttribute("countNam", nam);
        request.setAttribute("locations", locations);

        // Chuyển tiếp sang trang giao diện quản trị
        request.getRequestDispatcher("/admin.jsp").forward(request, response);
    }
}