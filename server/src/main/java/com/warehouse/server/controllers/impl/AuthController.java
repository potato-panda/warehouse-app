package com.warehouse.server.controllers.impl;

import com.warehouse.server.dtos.requests.auth.ChangePasswordRequestDTO;
import com.warehouse.server.dtos.requests.auth.LoginRequestDTO;
import com.warehouse.server.dtos.responses.auth.CurrentUserResponseDTO;
import com.warehouse.server.dtos.responses.auth.LoginResponseDTO;
import com.warehouse.server.exceptions.InvalidInputException;
import com.warehouse.server.exceptions.NotFoundException;
import com.warehouse.server.exceptions.UnauthorizedException;
import com.warehouse.server.services.impl.AuthServiceImpl;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.webmvc.BasePathAwareController;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@BasePathAwareController("/auth")
public class AuthController implements com.warehouse.server.controllers.AuthController {

    private final AuthServiceImpl authService;

    @Value("${security.jwt.expirationPeriod}")
    private long expirationPeriod;

    @Autowired
    public AuthController(AuthServiceImpl authService) {
        this.authService = authService;
    }

    @Override
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(HttpServletResponse response,
                                                  @Valid @RequestBody LoginRequestDTO loginRequestDTO,
                                                  BindingResult bindingResult) throws NotFoundException {
        if (bindingResult.hasErrors()) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(bindingResult.getAllErrors().toString());
        }
        var login = authService.login(loginRequestDTO.username(), loginRequestDTO.password());

        if (login != null) {
            var body = new LoginResponseDTO(login.accessToken(),
                                            expirationPeriod,
                                            login.user().getUsername(),
                                            login.user()
                                              .getAuthorities()
                                              .stream()
                                              .map(GrantedAuthority::getAuthority)
                                              .toList());

            // Header to set refreshToken to cookie
            setSecureCookie(response, login.refreshToken());

            return ResponseEntity.ok(body);
        }

        return ResponseEntity.badRequest().build();
    }

    @Override
    @PostMapping("/change-password")
    @Transactional
    public ResponseEntity<String> changePassword(HttpServletResponse response,
                                                 @Valid @RequestBody ChangePasswordRequestDTO changePasswordRequestDTO,
                                                 BindingResult bindingResult) throws InvalidInputException,
            NotFoundException {
        if (bindingResult.hasErrors()) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(bindingResult.getAllErrors().toString());
        }
        var success = authService.changePassword(changePasswordRequestDTO.oldPassword(),
                                                 changePasswordRequestDTO.password(),
                                                 changePasswordRequestDTO.confirmPassword());
        if (success != null) {
            // Header to set refreshToken to cookie
            setSecureCookie(response, success.refreshToken());

            return ResponseEntity.ok("Successfully changed password.");
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
    public ResponseEntity<CurrentUserResponseDTO> getCurrentUser() {
        var user = authService.getCurrentUser();
        if (user != null) {
            var response = new CurrentUserResponseDTO(user.getUsername(),
                                                      user.getAuthorities()
                                                       .stream()
                                                       .map(GrantedAuthority::getAuthority)
                                                       .toList());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @Override
    @PostMapping("/refresh-token")
    public ResponseEntity<LoginResponseDTO> refreshToken(@CookieValue("refreshToken") String refreshToken) throws UnauthorizedException {
        var body = authService.refreshToken(refreshToken);
        if (body != null) {
            return ResponseEntity.ok(body);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    private void setSecureCookie(HttpServletResponse response, String value) {
        var cookie = ResponseCookie.from("refreshToken", value);
        cookie.httpOnly(true);
        cookie.secure(true);
        cookie.sameSite("Strict");
        cookie.maxAge((int) expirationPeriod);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.build().toString());
    }

}
