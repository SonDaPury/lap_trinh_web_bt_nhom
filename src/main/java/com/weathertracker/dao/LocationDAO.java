package com.weathertracker.dao;

import com.weathertracker.config.DBContext;
import com.weathertracker.model.Location;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class LocationDAO {

    public List<Location> getAllLocations() {
        List<Location> list = new ArrayList<>();
        String sql = "SELECT l.location_id, l.city_name, l.region_id, r.region_name, " +
                "l.latitude, l.longitude, l.is_featured " +
                "FROM locations l JOIN regions r ON l.region_id = r.region_id " +
                "ORDER BY l.is_featured DESC, l.location_id ASC";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(new Location(
                        rs.getInt("location_id"),
                        rs.getString("city_name"),
                        rs.getInt("region_id"),
                        rs.getString("region_name"),
                        rs.getBigDecimal("latitude"),
                        rs.getBigDecimal("longitude"),
                        rs.getBoolean("is_featured")
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Location> searchLocations(String keyword) {
        List<Location> list = new ArrayList<>();
        String sql = "SELECT l.location_id, l.city_name, l.region_id, r.region_name, " +
                "l.latitude, l.longitude, l.is_featured " +
                "FROM locations l JOIN regions r ON l.region_id = r.region_id " +
                "WHERE l.city_name LIKE ? ORDER BY l.city_name ASC";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, "%" + keyword + "%");
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(new Location(
                            rs.getInt("location_id"),
                            rs.getString("city_name"),
                            rs.getInt("region_id"),
                            rs.getString("region_name"),
                            rs.getBigDecimal("latitude"),
                            rs.getBigDecimal("longitude"),
                            rs.getBoolean("is_featured")
                    ));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public boolean insertLocation(Location loc) {
        String sql = "INSERT INTO locations (city_name, region_id, latitude, longitude, is_featured) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, loc.getCityName());
            ps.setInt(2, loc.getRegionId());
            ps.setBigDecimal(3, loc.getLatitude());
            ps.setBigDecimal(4, loc.getLongitude());
            ps.setBoolean(5, loc.isFeatured());
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateLocation(Location loc) {
        String sql = "UPDATE locations SET city_name = ?, region_id = ?, latitude = ?, longitude = ?, is_featured = ? WHERE location_id = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, loc.getCityName());
            ps.setInt(2, loc.getRegionId());
            ps.setBigDecimal(3, loc.getLatitude());
            ps.setBigDecimal(4, loc.getLongitude());
            ps.setBoolean(5, loc.isFeatured());
            ps.setInt(6, loc.getLocationId());
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean deleteLocation(int locationId) {
        String sql = "DELETE FROM locations WHERE location_id = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, locationId);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
    public Location getLocationById(int id) {
        String sql = "SELECT l.location_id, l.city_name, l.region_id, r.region_name, l.latitude, l.longitude, l.is_featured " +
                "FROM locations l " +
                "JOIN regions r ON l.region_id = r.region_id " +
                "WHERE l.location_id = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Location(
                            rs.getInt("location_id"),
                            rs.getString("city_name"),
                            rs.getInt("region_id"),
                            rs.getString("region_name"),
                            rs.getBigDecimal("latitude"),
                            rs.getBigDecimal("longitude"),
                            rs.getBoolean("is_featured")
                    );
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}