package com.warehouse.server.controllers;

import com.warehouse.server.dtos.requests.ChangePasswordRequest;
import com.warehouse.server.dtos.requests.LoginRequest;
import com.warehouse.server.dtos.responses.LoginResponse;
import com.warehouse.server.entities.User;
import com.warehouse.server.exceptions.InvalidInputException;
import com.warehouse.server.exceptions.NotFoundException;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;

public interface AuthController {
    public ResponseEntity<LoginResponse> login(HttpServletResponse response,
                                               LoginRequest loginRequest,
                                               BindingResult bindingResult);

    public ResponseEntity<String> changePassword(ChangePasswordRequest changePasswordRequest,
                                                 BindingResult bindingResult) throws InvalidInputException,
            NotFoundException;

    public ResponseEntity<Object> logout(String refreshToken);

    public ResponseEntity<User> getCurrentUser();

    public ResponseEntity<LoginResponse> refreshToken(String refreshToken);

}
