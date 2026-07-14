package com.example.tripbudget;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.tripbudget.model.User;
import com.example.tripbudget.repository.UserRepository;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create Default Admin Account
        if (!userRepository.existsByEmail("admin@trip.com")) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@trip.com");
            admin.setPasswordHash(passwordEncoder.encode("admin"));
            admin.setTemporaryPassword("admin");
            userRepository.save(admin);
            System.out.println("Default Admin account created: admin@trip.com / admin");
        }

        // Create standard test accounts
        createTestUser("User One", "user1@trip.com", "password");
        createTestUser("User Two", "user2@trip.com", "password");
        createTestUser("User Three", "user3@trip.com", "password");
    }

    private void createTestUser(String name, String email, String password) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setTemporaryPassword(password);
            userRepository.save(user);
            System.out.println("Test account created: " + email + " / " + password);
        }
    }
}
