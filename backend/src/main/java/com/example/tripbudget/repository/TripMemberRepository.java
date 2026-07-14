package com.example.tripbudget.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.tripbudget.model.TripMember;

@Repository
public interface TripMemberRepository extends JpaRepository<TripMember, Long> {
    Optional<TripMember> findByTripIdAndUserId(Long tripId, Long userId);
    java.util.List<TripMember> findByTripId(Long tripId);
}
