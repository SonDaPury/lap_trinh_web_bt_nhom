package com.weathertracker.controller;

import com.weathertracker.dao.LocationDAO;
import com.weathertracker.model.Location;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.math.BigDecimal;

@WebServlet(name = "LocationController", urlPatterns = {"/admin/location"})
public class LocationController extends HttpServlet {

    private LocationDAO locationDAO;

    @Override
    public void init() throws ServletException {
        locationDAO = new LocationDAO();
    }

    // Xử lý Xóa qua URL: /admin/location?action=delete&id=...
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        if (!isAuthenticated(request)) {
            response.sendRedirect(request.getContextPath() + "/admin/login");
            return;
        }

        String action = request.getParameter("action");
        if ("delete".equalsIgnoreCase(action)) {
            try {
                int id = Integer.parseInt(request.getParameter("id"));
                locationDAO.deleteLocation(id);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        response.sendRedirect(request.getContextPath() + "/admin/dashboard");
    }

    // Xử lý Thêm mới (create) và Cập nhật (update) từ Modal Form
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");

        if (!isAuthenticated(request)) {
            response.sendRedirect(request.getContextPath() + "/admin/login");
            return;
        }

        String action = request.getParameter("action");
        String cityName = request.getParameter("cityName");
        String regionName = request.getParameter("regionName");
        BigDecimal latitude = new BigDecimal(request.getParameter("latitude"));
        BigDecimal longitude = new BigDecimal(request.getParameter("longitude"));
        boolean isFeatured = "true".equalsIgnoreCase(request.getParameter("isFeatured"));

        // Ánh xạ id vùng miền (1: Bắc, 2: Trung, 3: Nam)
        int regionId = 1;
        if (regionName.contains("Trung")) regionId = 2;
        else if (regionName.contains("Nam")) regionId = 3;

        if ("update".equalsIgnoreCase(action)) {
            int id = Integer.parseInt(request.getParameter("locationId"));
            Location loc = new Location(id, cityName, regionId, regionName, latitude, longitude, isFeatured);
            locationDAO.updateLocation(loc);
        } else {
            Location loc = new Location(cityName, regionId, latitude, longitude, isFeatured);
            locationDAO.insertLocation(loc);
        }

        response.sendRedirect(request.getContextPath() + "/admin/dashboard");
    }

    private boolean isAuthenticated(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session != null && session.getAttribute("adminUser") != null;
    }
}