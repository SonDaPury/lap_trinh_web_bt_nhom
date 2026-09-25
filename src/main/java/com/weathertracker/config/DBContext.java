package com.weathertracker.config;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * DBContext manages JDBC connections to MySQL database.
 * Supports environment variables (for Docker) with fallback to db.properties (for local dev).
 */
public class DBContext {

    private static String host;
    private static String port;
    private static String dbName;
    private static String user;
    private static String password;
    private static String params;

    static {
        loadConfiguration();
    }

    private static void loadConfiguration() {
        Properties props = new Properties();
        try (InputStream input = DBContext.class.getClassLoader().getResourceAsStream("db.properties")) {
            if (input != null) {
                props.load(input);
            }
        } catch (Exception e) {
            System.err.println("[DBContext] Could not load db.properties, relying on environment variables or defaults: " + e.getMessage());
        }

        // Ưu tiên đọc từ biến môi trường (Docker), nếu không có sẽ lấy từ db.properties hoặc giá trị mặc định
        host = getEnvOrDefault("DB_HOST", props.getProperty("db.host", "localhost"));
        port = getEnvOrDefault("DB_PORT", props.getProperty("db.port", "3306"));
        dbName = getEnvOrDefault("DB_NAME", props.getProperty("db.name", "location_weather_db"));
        user = getEnvOrDefault("DB_USER", props.getProperty("db.user", "root"));
        password = getEnvOrDefault("DB_PASSWORD", props.getProperty("db.password", "12345678"));
        params = props.getProperty("db.params", "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8");

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("[DBContext] MySQL JDBC Driver registered successfully.");
        } catch (ClassNotFoundException e) {
            System.err.println("[DBContext] Error: MySQL JDBC Driver not found: " + e.getMessage());
        }
    }

    private static String getEnvOrDefault(String key, String defaultValue) {
        String value = System.getenv(key);
        return (value != null && !value.trim().isEmpty()) ? value.trim() : defaultValue;
    }

    /**
     * Get a new connection to the database.
     */
    public static Connection getConnection() throws SQLException {
        String url = String.format("jdbc:mysql://%s:%s/%s%s", host, port, dbName, params);
        return DriverManager.getConnection(url, user, password);
    }

    /**
     * Test connection to MySQL.
     * @return true if connection is successful, false otherwise.
     */
    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            System.err.println("[DBContext] Connection test failed: " + e.getMessage());
            return false;
        }
    }

    public static String getHost() {
        return host;
    }

    public static String getPort() {
        return port;
    }

    public static String getDbName() {
        return dbName;
    }

    public static String getUser() {
        return user;
    }
}
