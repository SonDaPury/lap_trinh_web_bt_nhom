package com.weathertracker.config;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

import java.sql.Connection;

/**
 * Application Startup and Shutdown Listener.
 * Logs structured, informative ASCII banner and system diagnostic info.
 */
@WebListener
public class AppContextListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        long startTime = System.currentTimeMillis();
        boolean dbConnected = false;
        long pingMs = -1;

        // Kiểm tra kết nối MySQL và đo độ trễ (ping latency)
        try {
            long t0 = System.currentTimeMillis();
            try (Connection conn = DBContext.getConnection()) {
                if (conn != null && !conn.isClosed()) {
                    dbConnected = true;
                    pingMs = System.currentTimeMillis() - t0;
                }
            }
        } catch (Exception e) {
            dbConnected = false;
        }

        String serverInfo = sce.getServletContext().getServerInfo();
        String javaVersion = System.getProperty("java.version");
        String javaVendor = System.getProperty("java.vendor");
        String osName = System.getProperty("os.name") + " (" + System.getProperty("os.arch") + ")";

        StringBuilder banner = new StringBuilder();
        banner.append("\n");
        banner.append("================================================================================\n");
        banner.append("  _                     _   _              __          __        _   _               \n");
        banner.append(" | |                   | | (_)             \\ \\        / /       | | | |              \n");
        banner.append(" | |     ___   ___ __ _| |_ _  ___  _ __    \\ \\  /\\  / /__  __ _| |_| |__   ___ _ __ \n");
        banner.append(" | |    / _ \\ / __/ _` | __| |/ _ \\| '_ \\    \\ \\/  \\/ / _ \\/ _` | __| '_ \\ / _ \\ '__|\n");
        banner.append(" | |___| (_) | (_| (_| | |_| | (_) | | | |    \\  /\\  /  __/ (_| | |_| | | |  __/ |   \n");
        banner.append(" |______\\___/ \\___\\__,_|\\__|_|\\___/|_| |_|     \\/  \\/ \\___|\\__,_|\\__|_| |_|\\___|_|   \n");
        banner.append("================================================================================\n");
        banner.append(" 🚀 APPLICATION INITIALIZED SUCCESSFULLY!\n");
        banner.append("--------------------------------------------------------------------------------\n");
        banner.append(" 📌 Application Name : Location Weather App (MVC)\n");
        banner.append(" ☕ Java Runtime     : JDK ").append(javaVersion).append(" [").append(javaVendor).append("]\n");
        banner.append(" 💻 Host Platform    : ").append(osName).append("\n");
        banner.append(" 🐱 Servlet Engine   : ").append(serverInfo).append("\n");
        banner.append(" 🗄️ Database Engine  : MySQL 8.0\n");
        banner.append(" 🔗 Database Target  : ").append(DBContext.getHost()).append(":").append(DBContext.getPort()).append("/").append(DBContext.getDbName()).append("\n");
        banner.append(" 👤 Database User    : ").append(DBContext.getUser()).append("\n");
        if (dbConnected) {
            banner.append(" 🔌 Connection Status: ✅ CONNECTED (Ping: ").append(pingMs).append(" ms)\n");
        } else {
            banner.append(" 🔌 Connection Status: ❌ NOT CONNECTED (Check MySQL container status)\n");
        }
        banner.append("--------------------------------------------------------------------------------\n");
        banner.append(" 🌐 Web Endpoint     : http://localhost:8080/\n");
        banner.append(" 🩺 Status Endpoint  : http://localhost:8080/status\n");
        banner.append(" ⏱️ Startup Duration : ").append(System.currentTimeMillis() - startTime).append(" ms\n");
        banner.append("================================================================================\n");

        System.out.println(banner.toString());
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("\n[AppContextListener] 🛑 Application context stopped successfully. Cleanup complete.\n");
    }
}
