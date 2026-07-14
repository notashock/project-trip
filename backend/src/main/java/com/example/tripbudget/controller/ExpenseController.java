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
import com.example.tripbudget.repository.ExpenseRepository;

@RestController
@RequestMapping("/api/trips/{tripId}/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @GetMapping
    public ResponseEntity<List<Expense>> getExpenses(@PathVariable Long tripId) {
        List<Expense> expenses = expenseRepository.findByTripId(tripId);
        return ResponseEntity.ok(expenses);
    }

    @PostMapping
    public ResponseEntity<Expense> addExpense(@PathVariable Long tripId, @RequestBody Expense expense, @RequestAttribute("userId") Long userId) {
        expense.setTripId(tripId);
        expense.setAddedByUserId(userId);
        if (expense.getDate() == null) {
            expense.setDate(LocalDateTime.now());
        }
        Expense savedExpense = expenseRepository.save(expense);
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
        if (expenseDetails.getDate() != null) {
            expense.setDate(expenseDetails.getDate());
        }
        Expense updatedExpense = expenseRepository.save(expense);
        return ResponseEntity.ok(updatedExpense);
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long tripId, @PathVariable Long expenseId) {
        Optional<Expense> expenseOpt = expenseRepository.findById(expenseId);
        if (expenseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        expenseRepository.deleteById(expenseId);
        return ResponseEntity.ok(Map.of("message", "Expense deleted successfully"));
    }
}
