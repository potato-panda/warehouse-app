package com.warehouse.server.configs;

import com.warehouse.server.entities.Authority;
import com.warehouse.server.entities.User;
import com.warehouse.server.exceptions.InvalidInputException;
import com.warehouse.server.repositories.AuthorityRepository;
import com.warehouse.server.repositories.UserRepository;
import com.warehouse.server.services.UserService;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;

import java.util.List;

@TestConfiguration
public class TestConfig {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorityRepository authorityRepository;

    @Autowired
    private UserService userService;

    @PostConstruct
    @Transactional
    public void init() throws InvalidInputException {
        createInitialAuthorities();
        createInitialUsers();
    }

    void createInitialAuthorities() {
        if (!authorityRepository.existsByAuthority("ROLE_ADMIN")) {
            authorityRepository.save(new Authority("ROLE_ADMIN"));
        }
        if (!authorityRepository.existsByAuthority("ROLE_USER")) {
            authorityRepository.save(new Authority("ROLE_USER"));
        }
    }

    void createInitialUsers() throws InvalidInputException {
        Authority adminRole = authorityRepository.findByAuthority("ROLE_ADMIN").orElseThrow();
        Authority userRole  = authorityRepository.findByAuthority("ROLE_USER").orElseThrow();

        if (!userRepository.existsByUsername("admin")) {
            userService.createUser(new User("admin", "admin", List.of(adminRole), true));
        }
        if (!userRepository.existsByUsername("user")) {
            userService.createUser(new User("user", "user", List.of(userRole), true));
        }
    }
}
