
package com.weathertracker.model;

import java.math.BigDecimal;

public class Location {
    private int locationId;
    private String cityName;
    private int regionId;
    private String regionName;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private boolean isFeatured;

    public Location() {
    }

    public Location(int locationId, String cityName, int regionId, String regionName,
                    BigDecimal latitude, BigDecimal longitude, boolean isFeatured) {
        this.locationId = locationId;
        this.cityName = cityName;
        this.regionId = regionId;
        this.regionName = regionName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isFeatured = isFeatured;
    }

    public Location(String cityName, int regionId, BigDecimal latitude, BigDecimal longitude, boolean isFeatured) {
        this.cityName = cityName;
        this.regionId = regionId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isFeatured = isFeatured;
    }

    // Getters and Setters
    public int getLocationId() {
        return locationId;
    }

    public void setLocationId(int locationId) {
        this.locationId = locationId;
    }

    public String getCityName() {
        return cityName;
    }

    public void setCityName(String cityName) {
        this.cityName = cityName;
    }

    public int getRegionId() {
        return regionId;
    }

    public void setRegionId(int regionId) {
        this.regionId = regionId;
    }

    public String getRegionName() {
        return regionName;
    }

    public void setRegionName(String regionName) {
        this.regionName = regionName;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public boolean isFeatured() {
        return isFeatured;
    }

    public void setFeatured(boolean featured) {
        isFeatured = featured;
    }

    @Override
    public String toString() {
        return "Location{" +
                "locationId=" + locationId +
                ", cityName='" + cityName + '\'' +
                ", regionName='" + regionName + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", isFeatured=" + isFeatured +
                '}';
    }
}