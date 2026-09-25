package com.weathertracker.controller;

import com.weathertracker.config.DBContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Entrypoint Controller for the Java Web application.
 * Mapped to /home and /status to verify server health and MySQL connectivity.
 */
@WebServlet(name = "HomeController", urlPatterns = {"/home", "/status"})
public class HomeController extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // 1. Kiểm tra kết nối tới MySQL Database
        boolean isDbConnected = DBContext.testConnection();

        // 2. Thu thập thông tin hệ thống (Runtime & Environment)
        String javaVersion = System.getProperty("java.version");
        String serverInfo = getServletContext().getServerInfo();
        String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));

        // 3. Đưa thông tin vào request attribute
        request.setAttribute("isDbConnected", isDbConnected);
        request.setAttribute("dbHost", DBContext.getHost());
        request.setAttribute("dbPort", DBContext.getPort());
        request.setAttribute("dbName", DBContext.getDbName());
        request.setAttribute("dbUser", DBContext.getUser());
        request.setAttribute("javaVersion", javaVersion);
        request.setAttribute("serverInfo", serverInfo);
        request.setAttribute("currentTime", currentTime);

        // 4. Chuyển tiếp tới trang index.jsp để hiển thị
        request.getRequestDispatcher("/index.jsp").forward(request, response);
    }
}
