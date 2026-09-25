package com.weathertracker.config;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Filter that intercepts all HTTP requests and logs them with timestamp, method, URI, status, and duration.
 */
@WebFilter(filterName = "RequestLoggingFilter", urlPatterns = {"/*"})
public class RequestLoggingFilter implements Filter {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss.SSS");

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        if (request instanceof HttpServletRequest httpRequest && response instanceof HttpServletResponse httpResponse) {
            long startTime = System.currentTimeMillis();
            String method = httpRequest.getMethod();
            String uri = httpRequest.getRequestURI();
            String queryString = httpRequest.getQueryString();
            String fullPath = (queryString == null) ? uri : uri + "?" + queryString;

            try {
                chain.doFilter(request, response);
            } finally {
                long duration = System.currentTimeMillis() - startTime;
                int status = httpResponse.getStatus();
                String statusBadge;
                if (status >= 200 && status < 300) {
                    statusBadge = "🟢 " + status + " OK";
                } else if (status >= 300 && status < 400) {
                    statusBadge = "🔵 " + status + " REDIRECT";
                } else if (status >= 400 && status < 500) {
                    statusBadge = "🟡 " + status + " CLIENT ERROR";
                } else {
                    statusBadge = "🔴 " + status + " SERVER ERROR";
                }

                String timestamp = LocalDateTime.now().format(TIME_FORMATTER);
                System.out.printf("[%s] [HTTP] %-6s %-30s -> %-18s (%3d ms)%n",
                        timestamp, method, fullPath, statusBadge, duration);
            }
        } else {
            chain.doFilter(request, response);
        }
    }
}
