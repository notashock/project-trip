package com.example.tripbudget.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.tripbudget.model.Contribution;
import com.example.tripbudget.model.Trip;
import com.example.tripbudget.model.TripMember;
import com.example.tripbudget.repository.ContributionRepository;
import com.example.tripbudget.repository.TripMemberRepository;
import com.example.tripbudget.repository.TripRepository;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TripMemberRepository tripMemberRepository;

    @Autowired
    private ContributionRepository contributionRepository;

    public void recalculateAdjustedTarget(Long tripId) {
        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        if (tripOpt.isEmpty()) {
            return;
        }

        Trip trip = tripOpt.get();
        BigDecimal baseTarget = trip.getTargetPerPerson();
        if (baseTarget == null) {
            baseTarget = BigDecimal.ZERO;
        }

        if (trip.getAdjustForExtra() == null || !trip.getAdjustForExtra()) {
            trip.setAdjustedTarget(baseTarget);
            tripRepository.save(trip);
            return;
        }

        List<TripMember> members = tripMemberRepository.findByTripId(tripId);
        if (members.isEmpty()) {
            trip.setAdjustedTarget(baseTarget);
            tripRepository.save(trip);
            return;
        }

        BigDecimal target = baseTarget;
        if (Boolean.TRUE.equals(trip.getAdjustForExtra())) {
            List<Contribution> contributions = contributionRepository.findByTripId(tripId);
            contributions.sort(java.util.Comparator.comparing(Contribution::getDate));
            Map<Long, BigDecimal> rawPooled = new HashMap<>();

            for (Contribution c : contributions) {
                if (c.getUserId() == null || c.getAmount() == null) continue;
                rawPooled.put(c.getUserId(), rawPooled.getOrDefault(c.getUserId(), BigDecimal.ZERO).add(c.getAmount()));
                BigDecimal userRaw = rawPooled.get(c.getUserId());
                if (userRaw.compareTo(target) > 0) {
                    BigDecimal extra = userRaw.subtract(target);
                    BigDecimal increase = extra.divide(new BigDecimal(members.size()), 4, RoundingMode.HALF_UP);
                    target = target.add(increase);
                }
            }
        }

        trip.setAdjustedTarget(target);
        tripRepository.save(trip);
    }
}
