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

import com.example.tripbudget.model.Expense;
import com.example.tripbudget.model.Contribution;
import com.example.tripbudget.repository.ExpenseRepository;
import com.example.tripbudget.repository.ContributionRepository;

@RestController
@RequestMapping("/api/trips/{tripId}/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ContributionRepository contributionRepository;

    @GetMapping
    public ResponseEntity<List<Expense>> getExpenses(@PathVariable Long tripId) {
        List<Expense> expenses = expenseRepository.findByTripId(tripId);
        for (Expense e : expenses) {
            List<Contribution> linked = contributionRepository.findByExpenseId(e.getId());
            e.setAddAsContribution(linked != null && !linked.isEmpty());
        }
        return ResponseEntity.ok(expenses);
    }

    @PostMapping
    public ResponseEntity<Expense> addExpense(@PathVariable Long tripId, @RequestBody Expense expense, @RequestAttribute("userId") Long userId) {
        expense.setTripId(tripId);
        expense.setAddedByUserId(userId);
        if (expense.getMemberId() == null) {
            expense.setMemberId(userId);
        }
        if (expense.getDate() == null) {
            expense.setDate(LocalDateTime.now());
        }
        Expense savedExpense = expenseRepository.save(expense);
        syncContribution(tripId, savedExpense);
        
        List<Contribution> linked = contributionRepository.findByExpenseId(savedExpense.getId());
        savedExpense.setAddAsContribution(linked != null && !linked.isEmpty());
        
        return ResponseEntity.ok(savedExpense);
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<?> updateExpense(@PathVariable Long tripId, @PathVariable Long expenseId, @RequestBody Expense expenseDetails) {
        Optional<Expense> expenseOpt = expenseRepository.findById(expenseId);
        if (expenseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Expense expense = expenseOpt.get();
        expense.setTitle(expenseDetails.getTitle());
        expense.setAmount(expenseDetails.getAmount());
        expense.setNote(expenseDetails.getNote());
        expense.setPlace(expenseDetails.getPlace());
        expense.setCategory(expenseDetails.getCategory());
        expense.setFoodType(expenseDetails.getFoodType());
        expense.setTravelFrom(expenseDetails.getTravelFrom());
        expense.setTravelTo(expenseDetails.getTravelTo());
        expense.setTravelStartDate(expenseDetails.getTravelStartDate());
        expense.setTravelEndDate(expenseDetails.getTravelEndDate());
        expense.setRoomsCount(expenseDetails.getRoomsCount());
        expense.setPeopleCount(expenseDetails.getPeopleCount());
        expense.setCheckInDate(expenseDetails.getCheckInDate());
        expense.setCheckOutDate(expenseDetails.getCheckOutDate());
        expense.setMemberId(expenseDetails.getMemberId() != null ? expenseDetails.getMemberId() : expense.getAddedByUserId());
        expense.setAddAsContribution(expenseDetails.getAddAsContribution());
        if (expenseDetails.getDate() != null) {
            expense.setDate(expenseDetails.getDate());
        }
        Expense updatedExpense = expenseRepository.save(expense);
        syncContribution(tripId, updatedExpense);

        List<Contribution> linked = contributionRepository.findByExpenseId(updatedExpense.getId());
        updatedExpense.setAddAsContribution(linked != null && !linked.isEmpty());

        return ResponseEntity.ok(updatedExpense);
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long tripId, @PathVariable Long expenseId) {
        Optional<Expense> expenseOpt = expenseRepository.findById(expenseId);
        if (expenseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Delete linked contributions first
        List<Contribution> linked = contributionRepository.findByExpenseId(expenseId);
        if (linked != null && !linked.isEmpty()) {
            contributionRepository.deleteAll(linked);
        }

        expenseRepository.deleteById(expenseId);
        return ResponseEntity.ok(Map.of("message", "Expense deleted successfully"));
    }

    private void syncContribution(Long tripId, Expense expense) {
        if (Boolean.TRUE.equals(expense.getAddAsContribution())) {
            List<Contribution> linked = contributionRepository.findByExpenseId(expense.getId());
            Contribution c;
            if (linked != null && !linked.isEmpty()) {
                c = linked.get(0);
            } else {
                c = new Contribution();
                c.setTripId(tripId);
                c.setExpenseId(expense.getId());
            }
            c.setUserId(expense.getMemberId() != null ? expense.getMemberId() : expense.getAddedByUserId());
            c.setAmount(expense.getAmount());
            c.setDate(expense.getDate());
            c.setNote("Expense: " + expense.getTitle());
            c.setMethod("UPI");
            c.setStatus("Verified");
            contributionRepository.save(c);
        } else {
            List<Contribution> linked = contributionRepository.findByExpenseId(expense.getId());
            if (linked != null && !linked.isEmpty()) {
                contributionRepository.deleteAll(linked);
            }
        }
    }
}
