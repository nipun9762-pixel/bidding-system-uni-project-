package com.biddingsystem.controller;

import com.biddingsystem.entity.AuditLog;
import com.biddingsystem.entity.User;
import com.biddingsystem.repository.AuditLogRepository;
import com.biddingsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private AuditLogRepository auditLogRepo;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepo.findById(id)
                .map(user -> ResponseEntity.ok(sanitizeUser(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.getOrDefault("email", "").trim().toLowerCase();
        String password = credentials.getOrDefault("password", "");

        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        User user = userOpt.get();
        boolean matches = false;
        try {
            matches = passwordEncoder.matches(password, user.getPassword());
        } catch (Exception ignored) {}

        if (!matches && !password.equals(user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        auditLogRepo.save(new AuditLog(user, "USER_LOGIN", "User logged in successfully: " + email));
        return ResponseEntity.ok(Map.of(
                "token", "demo-jwt-token-" + user.getUserId(),
                "user", sanitizeUser(user)
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User newUser) {
        String email = newUser.getEmail() == null ? "" : newUser.getEmail().trim().toLowerCase();
        String password = newUser.getPassword();

        if (email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
        }

        if (newUser.getRole() == null || (!newUser.getRole().equals(User.Role.BUYER) && !newUser.getRole().equals(User.Role.SELLER))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only BUYER and SELLER roles can register."));
        }

        if (userRepo.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered."));
        }

        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(password));
        if (newUser.getAccountStatus() == null) {
            newUser.setAccountStatus(User.AccountStatus.ACTIVE);
        }

        User saved = userRepo.save(newUser);
        auditLogRepo.save(new AuditLog(saved, "USER_REGISTRATION", "New user registered: " + saved.getEmail()));
        return ResponseEntity.ok(Map.of(
                "message", "Registration successful.",
                "user", sanitizeUser(saved)
        ));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User incomingUser) {
        return userRepo.findById(id)
                .map(existing -> {
                    existing.setFirstName(incomingUser.getFirstName());
                    existing.setLastName(incomingUser.getLastName());
                    existing.setEmail(incomingUser.getEmail() == null ? existing.getEmail() : incomingUser.getEmail().trim().toLowerCase());
                    existing.setPhoneNumber(incomingUser.getPhoneNumber());
                    existing.setRole(incomingUser.getRole());
                    existing.setAccountStatus(incomingUser.getAccountStatus());

                    if (incomingUser.getPassword() != null && !incomingUser.getPassword().isBlank()) {
                        existing.setPassword(passwordEncoder.encode(incomingUser.getPassword()));
                    }

                    User updated = userRepo.save(existing);
                    return ResponseEntity.ok(Map.of("message", "User updated successfully.", "user", sanitizeUser(updated)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (userRepo.existsById(id)) {
            userRepo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully."));
        }
        return ResponseEntity.notFound().build();
    }

    private User sanitizeUser(User user) {
        user.setPassword(null);
        return user;
    }
}
