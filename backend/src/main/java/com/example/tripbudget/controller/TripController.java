package com.example.tripbudget.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.stream.Collectors;

import com.example.tripbudget.model.Role;
import com.example.tripbudget.model.Trip;
import com.example.tripbudget.model.TripMember;
import com.example.tripbudget.model.User;
import com.example.tripbudget.repository.ExpenseRepository;
import com.example.tripbudget.repository.TripMemberRepository;
import com.example.tripbudget.repository.TripRepository;
import com.example.tripbudget.repository.UserRepository;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TripMemberRepository tripMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private com.example.tripbudget.repository.ContributionRepository contributionRepository;

    @Autowired
    private com.example.tripbudget.service.TripService tripService;


    @GetMapping
    public ResponseEntity<?> getUserTrips(@RequestAttribute("userId") Long userId) {
        List<Trip> trips = tripRepository.findTripsByUserId(userId);
        List<Map<String, Object>> response = trips.stream().map(trip -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", trip.getId());
            map.put("name", trip.getName());
            map.put("destination", trip.getDestination() != null ? trip.getDestination() : "Goa, India");
            map.put("startDate", trip.getStartDate());
            map.put("endDate", trip.getEndDate());
            map.put("targetBudget", trip.getTargetBudget() != null ? trip.getTargetBudget() : java.math.BigDecimal.ZERO);
            map.put("targetPerPerson", trip.getTargetPerPerson());
            map.put("adjustForExtra", trip.getAdjustForExtra());
            map.put("adjustedTarget", trip.getAdjustedTarget());
            map.put("createdAt", trip.getCreatedAt());

            // Count members
            List<TripMember> members = tripMemberRepository.findByTripId(trip.getId());
            map.put("memberCount", members.size());

            // Get initials of first 3 members
            List<String> initials = members.stream().map(m -> {
                Optional<User> u = userRepository.findById(m.getUserId());
                if (u.isPresent()) {
                    String uName = u.get().getName();
                    if (uName != null && !uName.trim().isEmpty()) {
                        String[] parts = uName.trim().split("\\s+");
                        if (parts.length > 1) {
                            return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
                        } else {
                            return parts[0].substring(0, Math.min(parts[0].length(), 1)).toUpperCase();
                        }
                    }
                }
                return "??";
            }).limit(3).collect(Collectors.toList());
            map.put("memberInitials", initials);

            // Compute total expenses
            double totalSpent = expenseRepository.findByTripId(trip.getId()).stream()
                    .mapToDouble(e -> e.getAmount() != null ? e.getAmount().doubleValue() : 0.0)
                    .sum();
            map.put("totalSpent", totalSpent);

            // Determine status
            String status = "Upcoming";
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            if (trip.getStartDate() != null && trip.getEndDate() != null) {
                if (now.isAfter(trip.getEndDate())) {
                    status = "Completed";
                } else if (now.isAfter(trip.getStartDate())) {
                    status = "Active";
                }
            }
            map.put("status", status);

            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<?> getTripById(@PathVariable Long tripId, @RequestAttribute("userId") Long userId) {
        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        if (tripOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Optional<TripMember> memberOpt = tripMemberRepository.findByTripIdAndUserId(tripId, userId);
        if (memberOpt.isEmpty()) {
            return ResponseEntity.status(403).body(Map.of("message", "You are not a member of this trip"));
        }

        return ResponseEntity.ok(Map.of(
            "trip", tripOpt.get(),
            "role", memberOpt.get().getRole()
        ));
    }

    @PostMapping
    public ResponseEntity<?> createTrip(@RequestBody Trip trip, @RequestAttribute("userId") Long userId) {
        trip.setCreatedAt(LocalDateTime.now());
        trip.setFixedAt(trip.getCreatedAt());
        Trip savedTrip = tripRepository.save(trip);

        // Auto assign creator as ADMIN
        TripMember member = new TripMember();
        member.setTripId(savedTrip.getId());
        member.setUserId(userId);
        member.setRole(Role.ADMIN);
        tripMemberRepository.save(member);

        tripService.recalculateAdjustedTarget(savedTrip.getId());
        
        Trip finalTrip = tripRepository.findById(savedTrip.getId()).orElse(savedTrip);
        
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", finalTrip.getId());
        map.put("name", finalTrip.getName());
        map.put("destination", finalTrip.getDestination() != null ? finalTrip.getDestination() : "Goa, India");
        map.put("startDate", finalTrip.getStartDate());
        map.put("endDate", finalTrip.getEndDate());
        map.put("targetBudget", finalTrip.getTargetBudget() != null ? finalTrip.getTargetBudget() : java.math.BigDecimal.ZERO);
        map.put("targetPerPerson", finalTrip.getTargetPerPerson());
        map.put("adjustForExtra", finalTrip.getAdjustForExtra());
        map.put("adjustedTarget", finalTrip.getAdjustedTarget());
        map.put("createdAt", finalTrip.getCreatedAt());
        map.put("memberCount", 1);
        
        Optional<User> u = userRepository.findById(userId);
        List<String> initials = new java.util.ArrayList<>();
        if (u.isPresent()) {
            String uName = u.get().getName();
            if (uName != null && !uName.trim().isEmpty()) {
                String[] parts = uName.trim().split("\\s+");
                if (parts.length > 1) {
                    initials.add((parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase());
                } else {
                    initials.add(parts[0].substring(0, Math.min(parts[0].length(), 1)).toUpperCase());
                }
            } else {
                initials.add("??");
            }
        } else {
            initials.add("??");
        }
        map.put("memberInitials", initials);
        map.put("totalSpent", 0.0);
        map.put("status", "Upcoming");
        
        return ResponseEntity.ok(map);
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<?> updateTrip(@PathVariable Long tripId, @RequestBody Trip tripDetails, @RequestAttribute("userId") Long userId) {
        Optional<TripMember> memberOpt = tripMemberRepository.findByTripIdAndUserId(tripId, userId);
        if (memberOpt.isEmpty() || memberOpt.get().getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Only ADMIN can edit trip details"));
        }

        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        if (tripOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Trip trip = tripOpt.get();
        trip.setName(tripDetails.getName());
        trip.setDestination(tripDetails.getDestination());
        trip.setStartDate(tripDetails.getStartDate());
        trip.setEndDate(tripDetails.getEndDate());
        trip.setTargetBudget(tripDetails.getTargetBudget());
        trip.setStrictBudgetMode(tripDetails.getStrictBudgetMode());
        trip.setWhoCanAddExpenses(tripDetails.getWhoCanAddExpenses());
        trip.setWhoCanAddMembers(tripDetails.getWhoCanAddMembers());
        trip.setPushNotifications(tripDetails.getPushNotifications());
        trip.setPrivateTrip(tripDetails.getPrivateTrip());

        if (Boolean.TRUE.equals(tripDetails.getFixAdjustedTarget())) {
            if (trip.getAdjustedTarget() != null) {
                trip.setTargetPerPerson(trip.getAdjustedTarget());
            }
            trip.setAdjustForExtra(false);
            trip.setFixedAt(LocalDateTime.now());
        } else {
            trip.setTargetPerPerson(tripDetails.getTargetPerPerson());
            if (tripDetails.getAdjustForExtra() != null) {
                trip.setAdjustForExtra(tripDetails.getAdjustForExtra());
            }
        }
        tripRepository.save(trip);

        tripService.recalculateAdjustedTarget(tripId);

        return ResponseEntity.ok(tripRepository.findById(tripId).orElse(trip));
    }

    @org.springframework.transaction.annotation.Transactional
    @DeleteMapping("/{tripId}")
    public ResponseEntity<?> deleteTrip(@PathVariable Long tripId, @RequestAttribute("userId") Long userId) {
        Optional<TripMember> memberOpt = tripMemberRepository.findByTripIdAndUserId(tripId, userId);
        if (memberOpt.isEmpty() || memberOpt.get().getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Only ADMIN can delete a trip"));
        }

        contributionRepository.deleteByTripId(tripId);
        expenseRepository.deleteByTripId(tripId);
        tripMemberRepository.deleteByTripId(tripId);
        tripRepository.deleteById(tripId);
        
        return ResponseEntity.ok(Map.of("message", "Trip deleted successfully"));
    }
}
