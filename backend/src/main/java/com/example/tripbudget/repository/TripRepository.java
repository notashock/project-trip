package com.example.tripbudget.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.tripbudget.model.Trip;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    @Query("SELECT t FROM Trip t JOIN TripMember tm ON t.id = tm.tripId WHERE tm.userId = :userId")
    List<Trip> findTripsByUserId(@Param("userId") Long userId);
}
