package com.warehouse.server.controllers.impl;

import com.warehouse.server.dtos.requests.ChangePasswordRequest;
import com.warehouse.server.dtos.requests.LoginRequest;
import com.warehouse.server.dtos.responses.LoginResponse;
import com.warehouse.server.entities.User;
import com.warehouse.server.exceptions.InvalidInputException;
import com.warehouse.server.exceptions.NotFoundException;
import com.warehouse.server.services.impl.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController implements com.warehouse.server.controllers.AuthController {

    private final AuthService authService;

    @Value("${security.jwt.expirationPeriod}")
    private long expirationPeriod;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Override
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(HttpServletResponse response,
                                               @Valid @RequestBody LoginRequest loginRequest,
                                               BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(bindingResult.getAllErrors().toString());
        }
        var login = authService.login(loginRequest.username(), loginRequest.password());

        if (login != null) {
            var body = new LoginResponse(login.accessToken(),
                                         expirationPeriod,
                                         login.user().getUsername(),
                                         login.user()
                                              .getAuthorities()
                                              .stream()
                                              .map(GrantedAuthority::getAuthority)
                                              .toList());

            var cookie = new Cookie("refreshToken", login.refreshToken());
            cookie.setHttpOnly(true);
            cookie.setSecure(true);
            response.addCookie(cookie);

            return ResponseEntity.ok(body);
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    @Override
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest,
                                                 BindingResult bindingResult) throws InvalidInputException,
            NotFoundException {
        if (bindingResult.hasErrors()) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(bindingResult.getAllErrors().toString());
        }
        var success = authService.changePassword(changePasswordRequest.oldPassword(),
                                                 changePasswordRequest.password(),
                                                 changePasswordRequest.confirmPassword());
        if (success != null) {
            ResponseEntity.ok("Successfully changed password.");
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @Override
    @PostMapping("/logout")
    public ResponseEntity<Object> logout(@CookieValue("refreshToken") String refreshToken) {
        if (refreshToken != null) {
            authService.logout(refreshToken);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @Override
    @GetMapping("/current-user")
    public ResponseEntity<User> getCurrentUser() {
        var user = authService.getCurrentUser();
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @Override
    @PostMapping("/refresh-token")
    public ResponseEntity<LoginResponse> refreshToken(@CookieValue("refreshToken") String refreshToken) {
        var body = authService.refreshToken(refreshToken);
        if (body != null) {
            return ResponseEntity.ok(body);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

}
