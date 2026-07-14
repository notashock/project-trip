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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.tripbudget.model.Contribution;
import com.example.tripbudget.repository.ContributionRepository;

@RestController
@RequestMapping("/api/trips/{tripId}/contributions")
public class ContributionController {

    @Autowired
    private ContributionRepository contributionRepository;

    @Autowired
    private com.example.tripbudget.service.TripService tripService;


    @GetMapping
    public ResponseEntity<List<Contribution>> getContributions(@PathVariable Long tripId) {
        List<Contribution> contributions = contributionRepository.findByTripId(tripId);
        return ResponseEntity.ok(contributions);
    }

    @PostMapping
    public ResponseEntity<Contribution> addContribution(@PathVariable Long tripId, @RequestBody Contribution contribution) {
        contribution.setTripId(tripId);
        if (contribution.getDate() == null) {
            contribution.setDate(LocalDateTime.now());
        }
        Contribution savedContribution = contributionRepository.save(contribution);
        tripService.recalculateAdjustedTarget(tripId);
        return ResponseEntity.ok(savedContribution);
    }

    @PutMapping("/{contributionId}")
    public ResponseEntity<?> updateContribution(@PathVariable Long tripId, @PathVariable Long contributionId, @RequestBody Contribution details) {
        Optional<Contribution> contributionOpt = contributionRepository.findById(contributionId);
        if (contributionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Contribution contribution = contributionOpt.get();
        contribution.setAmount(details.getAmount());
        contribution.setUserId(details.getUserId());
        contribution.setNote(details.getNote());
        if (details.getMethod() != null) {
            contribution.setMethod(details.getMethod());
        }
        if (details.getStatus() != null) {
            contribution.setStatus(details.getStatus());
        }
        if (details.getDate() != null) {
            contribution.setDate(details.getDate());
        }
        Contribution updatedContribution = contributionRepository.save(contribution);
        tripService.recalculateAdjustedTarget(tripId);
        return ResponseEntity.ok(updatedContribution);
    }

    @DeleteMapping("/{contributionId}")
    public ResponseEntity<?> deleteContribution(@PathVariable Long tripId, @PathVariable Long contributionId) {
        Optional<Contribution> contributionOpt = contributionRepository.findById(contributionId);
        if (contributionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        contributionRepository.deleteById(contributionId);
        tripService.recalculateAdjustedTarget(tripId);
        return ResponseEntity.ok(Map.of("message", "Contribution deleted successfully"));
    }
}
