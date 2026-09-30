package com.weathertracker.controller;

import com.weathertracker.dao.LocationDAO;
import com.weathertracker.model.Location;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

@WebServlet(name = "DetailController", urlPatterns = {"/detail"})
public class DetailController extends HttpServlet {

    private LocationDAO locationDAO;

    @Override
    public void init() throws ServletException {
        locationDAO = new LocationDAO();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String idParam = request.getParameter("id");
        int locationId = 1; // Mặc định là Hà Nội nếu không có param

        if (idParam != null && !idParam.trim().isEmpty()) {
            try {
                locationId = Integer.parseInt(idParam);
            } catch (NumberFormatException e) {
                locationId = 1;
            }
        }

        Location location = locationDAO.getLocationById(locationId);
        if (location == null) {
            location = locationDAO.getLocationById(1);
        }

        List<Location> allLocations = locationDAO.getAllLocations();

        request.setAttribute("location", location);
        request.setAttribute("locations", allLocations);

        request.getRequestDispatcher("/detail.jsp").forward(request, response);
    }
}