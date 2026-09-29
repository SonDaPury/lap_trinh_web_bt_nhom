package com.weathertracker.dao;

import com.weathertracker.config.DBContext;
import com.weathertracker.model.Admin;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class AdminDAO {

    public Admin checkLogin(String username, String password) {
        String sql = "SELECT admin_id, username, password, full_name FROM admins WHERE username = ? AND password = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, username);
            ps.setString(2, password);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Admin(
                            rs.getInt("admin_id"),
                            rs.getString("username"),
                            rs.getString("password"),
                            rs.getString("full_name")
                    );
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public int countLocationsByRegion(String regionKeyword) {
        String sql;
        if ("ALL".equalsIgnoreCase(regionKeyword)) {
            sql = "SELECT COUNT(*) FROM locations";
        } else {
            sql = "SELECT COUNT(*) FROM locations l JOIN regions r ON l.region_id = r.region_id WHERE r.region_name LIKE ?";
        }

        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            if (!"ALL".equalsIgnoreCase(regionKeyword)) {
                ps.setString(1, "%" + regionKeyword + "%");
            }
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }
}