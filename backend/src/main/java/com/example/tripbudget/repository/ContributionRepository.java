package com.example.tripbudget.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.tripbudget.model.Contribution;

@Repository
public interface ContributionRepository extends JpaRepository<Contribution, Long> {
    List<Contribution> findByTripId(Long tripId);
    List<Contribution> findByTripIdAndUserId(Long tripId, Long userId);
    List<Contribution> findByExpenseId(Long expenseId);
}
