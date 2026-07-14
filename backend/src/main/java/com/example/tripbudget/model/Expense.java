package com.example.tripbudget.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Expense {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long tripId;
    
    private String title;
    
    private BigDecimal amount;
    
    private LocalDateTime date;
    
    private Long addedByUserId;

    private String note;

    private String place;

    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    private ExpenseCategory category;

    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    private FoodType foodType;

    private String travelFrom;

    private String travelTo;

    private LocalDateTime travelStartDate;

    private LocalDateTime travelEndDate;

    private Integer roomsCount;

    private Integer peopleCount;

    private LocalDateTime checkInDate;

    private LocalDateTime checkOutDate;
}
