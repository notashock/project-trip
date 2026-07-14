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
@Table(name = "trips")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Trip {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    private BigDecimal targetPerPerson;
    
    private LocalDateTime createdAt;

    private Boolean adjustForExtra = false;

    private BigDecimal adjustedTarget;

    @jakarta.persistence.Transient
    private Boolean fixAdjustedTarget = false;

    private LocalDateTime fixedAt;

    private String destination;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private BigDecimal targetBudget;

    private Boolean strictBudgetMode = true;

    private String whoCanAddExpenses = "All Members";

    private String whoCanAddMembers = "Admins Only";

    private Boolean pushNotifications = true;

    private Boolean privateTrip = true;
}
