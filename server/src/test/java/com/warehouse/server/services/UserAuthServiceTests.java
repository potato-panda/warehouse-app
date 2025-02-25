package com.warehouse.server.services;

import com.warehouse.server.configs.TestConfig;
import com.warehouse.server.dtos.responses.auth.SuccessfulLoginDTO;
import com.warehouse.server.entities.User;
import com.warehouse.server.exceptions.NotFoundException;
import com.warehouse.server.repositories.RefreshTokenRepository;
import com.warehouse.server.repositories.UserRepository;
import com.warehouse.server.services.impl.AuthService;
import com.warehouse.server.services.impl.JwtService;
import com.warehouse.server.services.impl.UserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
@Import(TestConfig.class)
public class UserAuthServiceTests {

    private final AuthService    authService;
    private final UserRepository userRepository;

    @Autowired
    public UserAuthServiceTests(UserRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                JwtService jwtService,
                                RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.authService    = new AuthService(passwordEncoder,
                                              new UserDetailsService(userRepository, passwordEncoder),
                                              userRepository,
                                              jwtService,
                                              refreshTokenRepository);
    }

    @Test
    public void testLogin() throws NotFoundException {
        String username = "admin";
        String password = "admin";

        SuccessfulLoginDTO login = authService.login(username, password);

        assertNotNull(login);
        assertEquals(username, login.user().getUsername());
    }

    @Test
    public void testUserCreation() {
        String username = "newuser";
        String password = "password";

        UserDetails exists = userRepository.getUsersByUsername("newuser");
        if (exists == null) {
            var encryptedPassword = new BCryptPasswordEncoder().encode(password);
            var user              = new User(username, encryptedPassword, List.of(), true);

            var saved = userRepository.save(user);

            assertNotNull(saved);
            assertEquals(username, saved.getUsername());
        } else {
            assert false;
        }
    }
}