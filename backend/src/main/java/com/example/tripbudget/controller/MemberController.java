package com.example.tripbudget.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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

import com.example.tripbudget.model.Contribution;
import com.example.tripbudget.model.TripMember;
import com.example.tripbudget.model.User;
import com.example.tripbudget.repository.ContributionRepository;
import com.example.tripbudget.repository.TripMemberRepository;
import com.example.tripbudget.repository.UserRepository;

@RestController
@RequestMapping("/api/trips/{tripId}/members")
public class MemberController {

    @Autowired
    private TripMemberRepository tripMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private ContributionRepository contributionRepository;

    @Autowired
    private com.example.tripbudget.service.TripService tripService;

    @Autowired
    private com.example.tripbudget.repository.TripRepository tripRepository;



    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getMembers(@PathVariable Long tripId) {
        List<TripMember> members = tripMemberRepository.findAll().stream()
                .filter(m -> m.getTripId().equals(tripId))
                .collect(Collectors.toList());

        com.example.tripbudget.model.Trip trip = tripRepository.findById(tripId).orElse(null);
        final java.math.BigDecimal finalTarget = (trip != null && trip.getAdjustedTarget() != null)
                ? trip.getAdjustedTarget()
                : (trip != null && trip.getTargetPerPerson() != null ? trip.getTargetPerPerson() : java.math.BigDecimal.ZERO);
        final boolean isAdjustActive = trip != null && Boolean.TRUE.equals(trip.getAdjustForExtra());

        final java.time.LocalDateTime fixedAt = (trip != null && trip.getFixedAt() != null) ? trip.getFixedAt() : java.time.LocalDateTime.now();

        List<Contribution> contributions = contributionRepository.findByTripId(tripId);
        Map<Long, java.math.BigDecimal> oldPooledByUser = new HashMap<>();
        Map<Long, java.math.BigDecimal> newPooledByUser = new HashMap<>();
        for (Contribution c : contributions) {
            if (c.getUserId() != null && c.getAmount() != null) {
                boolean isNew = c.getDate() != null && c.getDate().isAfter(fixedAt);
                if (isNew) {
                    newPooledByUser.put(c.getUserId(), newPooledByUser.getOrDefault(c.getUserId(), java.math.BigDecimal.ZERO).add(c.getAmount()));
                } else {
                    oldPooledByUser.put(c.getUserId(), oldPooledByUser.getOrDefault(c.getUserId(), java.math.BigDecimal.ZERO).add(c.getAmount()));
                }
            }
        }

        List<Map<String, Object>> response = members.stream().map(member -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", member.getId());
            map.put("role", member.getRole());
            map.put("userId", member.getUserId());
            map.put("customTag", member.getCustomTag());

            java.math.BigDecimal oldAmt = oldPooledByUser.getOrDefault(member.getUserId(), java.math.BigDecimal.ZERO);
            java.math.BigDecimal newAmt = newPooledByUser.getOrDefault(member.getUserId(), java.math.BigDecimal.ZERO);

            java.math.BigDecimal excessOwed = java.math.BigDecimal.ZERO;
            java.math.BigDecimal cappedOldAmt = oldAmt;
            if (oldAmt.compareTo(finalTarget) > 0) {
                cappedOldAmt = finalTarget;
                excessOwed = oldAmt.subtract(finalTarget);
            }

            java.math.BigDecimal pooledAmt = cappedOldAmt.add(newAmt);
            java.math.BigDecimal remaining = finalTarget.subtract(pooledAmt);
            java.math.BigDecimal owes = java.math.BigDecimal.ZERO;
            java.math.BigDecimal owed = java.math.BigDecimal.ZERO;
            if (remaining.compareTo(java.math.BigDecimal.ZERO) > 0) {
                owes = remaining;
            } else if (excessOwed.compareTo(java.math.BigDecimal.ZERO) > 0) {
                owed = excessOwed;
            }

            map.put("totalContributed", pooledAmt);
            map.put("owes", owes);
            map.put("owed", owed);
            
            userRepository.findById(member.getUserId()).ifPresent(user -> {
                map.put("userName", user.getName());
                map.put("userEmail", user.getEmail());
            });
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> addMember(@PathVariable Long tripId, @RequestBody Map<String, String> request) {
        String email = request.get("email");
        String roleStr = request.get("role");
        String customTag = request.get("customTag");
        String name = request.get("name");

        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;
        String temporaryPassword = null;

        if (userOpt.isEmpty()) {
            user = new User();
            if (name == null || name.trim().isEmpty()) {
                int atIdx = email.indexOf('@');
                name = atIdx != -1 ? email.substring(0, atIdx) : email;
            }
            user.setName(name);
            user.setEmail(email);
            temporaryPassword = java.util.UUID.randomUUID().toString().substring(0, 8);
            user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
            user.setTemporaryPassword(temporaryPassword);
            user = userRepository.save(user);
        } else {
            user = userOpt.get();
        }

        Optional<TripMember> existingMember = tripMemberRepository.findByTripIdAndUserId(tripId, user.getId());
        if (existingMember.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User is already a member of this trip"));
        }

        TripMember newMember = new TripMember();
        newMember.setTripId(tripId);
        newMember.setUserId(user.getId());
        newMember.setCustomTag(customTag);
        try {
            newMember.setRole(com.example.tripbudget.model.Role.valueOf(roleStr));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role specified"));
        }

        TripMember saved = tripMemberRepository.save(newMember);

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("id", saved.getId());
        responseMap.put("tripId", saved.getTripId());
        responseMap.put("userId", saved.getUserId());
        responseMap.put("role", saved.getRole());
        responseMap.put("customTag", saved.getCustomTag());
        responseMap.put("userName", user.getName());
        responseMap.put("userEmail", user.getEmail());
        if (temporaryPassword != null) {
            responseMap.put("temporaryPassword", temporaryPassword);
        }

        tripService.recalculateAdjustedTarget(tripId);
        return ResponseEntity.ok(responseMap);
    }

    @PutMapping("/{memberId}")
    public ResponseEntity<?> updateMemberRole(@PathVariable Long tripId, @PathVariable Long memberId, @RequestBody Map<String, String> request) {
        Optional<TripMember> memberOpt = tripMemberRepository.findById(memberId);
        if (memberOpt.isEmpty() || !memberOpt.get().getTripId().equals(tripId)) {
            return ResponseEntity.notFound().build();
        }

        TripMember member = memberOpt.get();
        String roleStr = request.get("role");
        member.setCustomTag(request.get("customTag"));
        try {
            member.setRole(com.example.tripbudget.model.Role.valueOf(roleStr));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role specified"));
        }

        TripMember updated = tripMemberRepository.save(member);
        tripService.recalculateAdjustedTarget(tripId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<?> removeMember(@PathVariable Long tripId, @PathVariable Long memberId) {
        Optional<TripMember> memberOpt = tripMemberRepository.findById(memberId);
        if (memberOpt.isEmpty() || !memberOpt.get().getTripId().equals(tripId)) {
            return ResponseEntity.notFound().build();
        }

        Long userId = memberOpt.get().getUserId();

        // 1. Delete associated contributions for this member in this trip
        List<Contribution> memberContributions = contributionRepository.findByTripIdAndUserId(tripId, userId);
        contributionRepository.deleteAll(memberContributions);

        // 2. Delete member record
        tripMemberRepository.deleteById(memberId);

        tripService.recalculateAdjustedTarget(tripId);

        return ResponseEntity.ok(Map.of("message", "Member removed and contributions cleared successfully"));
    }

    @GetMapping("/{memberId}/password")
    public ResponseEntity<?> getMemberPassword(@PathVariable Long tripId, @PathVariable Long memberId, @RequestAttribute("userId") Long currentUserId) {
        Optional<TripMember> currentUserMemberOpt = tripMemberRepository.findByTripIdAndUserId(tripId, currentUserId);
        if (currentUserMemberOpt.isEmpty() || currentUserMemberOpt.get().getRole() != com.example.tripbudget.model.Role.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Only ADMIN can view member passwords"));
        }

        Optional<TripMember> targetMemberOpt = tripMemberRepository.findById(memberId);
        if (targetMemberOpt.isEmpty() || !targetMemberOpt.get().getTripId().equals(tripId)) {
            return ResponseEntity.notFound().build();
        }

        Optional<User> userOpt = userRepository.findById(targetMemberOpt.get().getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String password = userOpt.get().getTemporaryPassword();
        System.out.println("Temp password fetched for " + userOpt.get().getEmail() + ": " + password);
        return ResponseEntity.ok(Map.of("temporaryPassword", password != null ? password : "No temporary password set"));
    }
}
