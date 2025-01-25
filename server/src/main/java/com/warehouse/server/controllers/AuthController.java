package com.warehouse.server.controllers;

import com.warehouse.server.dtos.requests.ChangePasswordRequest;
import com.warehouse.server.dtos.requests.LoginRequest;
import com.warehouse.server.dtos.responses.CurrentUserResponse;
import com.warehouse.server.dtos.responses.LoginResponse;
import com.warehouse.server.exceptions.InvalidInputException;
import com.warehouse.server.exceptions.NotFoundException;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;

public interface AuthController {
    ResponseEntity<LoginResponse> login(HttpServletResponse response,
                                        LoginRequest loginRequest,
                                        BindingResult bindingResult);

    ResponseEntity<String> changePassword(HttpServletResponse response,
                                          ChangePasswordRequest changePasswordRequest,
                                          BindingResult bindingResult) throws InvalidInputException,
            NotFoundException;

    ResponseEntity<Object> logout(String refreshToken);

    ResponseEntity<CurrentUserResponse> getCurrentUser();

    ResponseEntity<LoginResponse> refreshToken(String refreshToken);

}
