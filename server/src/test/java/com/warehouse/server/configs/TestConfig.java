package com.warehouse.server.configs;

import com.warehouse.server.entities.Authority;
import com.warehouse.server.entities.User;
import com.warehouse.server.repositories.AuthorityRepository;
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
    private AuthorityRepository authorityRepository;

    @PostConstruct
    public void init() {
        if (authorityRepository.count() == 0) {
            authorityRepository.save(new Authority("ROLE_ADMIN"));
            authorityRepository.save(new Authority("ROLE_USER"));
        }
        if (userRepository.count() <= 2) {
            userRepository.save(
                    new User(
                            "admin",
                            new PasswordEncoderConfig().passwordEncoder().encode("admin"),
                            List.of(new Authority("ROLE_ADMIN")),
                            true)
                               );
            userRepository.save(
                    new User(
                            "user",
                            new PasswordEncoderConfig().passwordEncoder().encode("user"),
                            List.of(new Authority("ROLE_USER")),
                            true)
                               );
        }
    }
}
