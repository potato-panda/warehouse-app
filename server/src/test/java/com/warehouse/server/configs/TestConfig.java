package com.warehouse.server.configs;

import com.warehouse.server.entities.Role;
import com.warehouse.server.entities.User;
import com.warehouse.server.repositories.RoleRepository;
import com.warehouse.server.repositories.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;

import java.util.List;

@TestConfiguration
public class TestConfig {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @PostConstruct
    public void init() {
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role("ROLE_ADMIN"));
            roleRepository.save(new Role("ROLE_USER"));
        }
        if (userRepository.count() <= 2) {
            userRepository.save(
                    new User(
                            "admin",
                            new PasswordEncoderConfig().passwordEncoder().encode("admin"),
                            List.of(new Role("ROLE_ADMIN")),
                            true)
            );
            userRepository.save(
                    new User(
                            "user",
                            new PasswordEncoderConfig().passwordEncoder().encode("user"),
                            List.of(new Role("ROLE_USER")),
                            true)
            );
        }
    }
}
