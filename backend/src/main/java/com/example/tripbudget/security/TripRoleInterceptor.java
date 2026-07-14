package com.example.tripbudget.security;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import com.example.tripbudget.model.Role;
import com.example.tripbudget.model.Trip;
import com.example.tripbudget.model.TripMember;
import com.example.tripbudget.repository.TripMemberRepository;
import com.example.tripbudget.repository.TripRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class TripRoleInterceptor implements HandlerInterceptor {

    @Autowired
    private TripMemberRepository tripMemberRepository;

    @Autowired
    private TripRepository tripRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        @SuppressWarnings("unchecked")
        Map<String, String> pathVariables = (Map<String, String>) request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        if (pathVariables == null || !pathVariables.containsKey("tripId")) {
            return true;
        }
        
        Long tripId;
        try {
            tripId = Long.parseLong(pathVariables.get("tripId"));
        } catch (NumberFormatException e) {
            return true; 
        }
        
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }

        TripMember member = tripMemberRepository.findByTripIdAndUserId(tripId, userId).orElse(null);
        if (member == null) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return false;
        }

        Trip trip = tripRepository.findById(tripId).orElse(null);
        String method = request.getMethod();
        String uri = request.getRequestURI();
        Role role = member.getRole();

        // 1. Member Management (e.g. /api/trips/{tripId}/members/**)
        if (uri.contains("/members")) {
            if (!method.equals("GET")) {
                boolean canAdd = false;
                if (trip != null && "All Members".equalsIgnoreCase(trip.getWhoCanAddMembers())) {
                    canAdd = true; // any member
                } else {
                    canAdd = (role == Role.ADMIN); // Admins Only
                }
                if (!canAdd) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    return false;
                }
            }
        }
        
        // 2. Expenses and Contributions Write Management (POST, PUT, DELETE)
        if (uri.contains("/expenses") || uri.contains("/contributions")) {
            if (!method.equals("GET")) {
                boolean canAdd = false;
                if (trip != null && "All Members".equalsIgnoreCase(trip.getWhoCanAddExpenses())) {
                    canAdd = true; // any member
                } else {
                    canAdd = (role == Role.ADMIN || role == Role.MANAGER); // Admins/Managers only
                }
                if (!canAdd) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    return false;
                }
            }
        }

        request.setAttribute("tripRole", role);
        return true;
    }
}

