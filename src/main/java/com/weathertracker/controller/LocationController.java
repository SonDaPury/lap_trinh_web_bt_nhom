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
                boolean success = locationDAO.deleteLocation(id);
                if (success) {
                    request.getSession().setAttribute("toastMessage", "Đã xóa địa phương thành công!");
                    request.getSession().setAttribute("toastType", "success");
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        response.sendRedirect(request.getContextPath() + "/admin/dashboard");
    }

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

        int regionId = 1;
        if (regionName.contains("Trung")) regionId = 2;
        else if (regionName.contains("Nam")) regionId = 3;

        if ("update".equalsIgnoreCase(action)) {
            int id = Integer.parseInt(request.getParameter("locationId"));
            Location loc = new Location(id, cityName, regionId, regionName, latitude, longitude, isFeatured);
            boolean success = locationDAO.updateLocation(loc);
            if (success) {
                request.getSession().setAttribute("toastMessage", "Đã cập nhật thông tin \"" + cityName + "\" thành công!");
                request.getSession().setAttribute("toastType", "success");
            }
        } else {
            Location loc = new Location(cityName, regionId, latitude, longitude, isFeatured);
            boolean success = locationDAO.insertLocation(loc);
            if (success) {
                request.getSession().setAttribute("toastMessage", "Đã thêm mới địa phương \"" + cityName + "\" thành công!");
                request.getSession().setAttribute("toastType", "success");
            }
        }
        response.sendRedirect(request.getContextPath() + "/admin/dashboard");
    }

    private boolean isAuthenticated(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session != null && session.getAttribute("adminUser") != null;
    }
}