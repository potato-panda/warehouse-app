package com.warehouse.server.controllers;

import com.warehouse.server.dtos.requests.auth.ChangePasswordRequestDTO;
import com.warehouse.server.dtos.requests.auth.LoginRequestDTO;
import com.warehouse.server.dtos.responses.auth.CurrentUserResponseDTO;
import com.warehouse.server.dtos.responses.auth.LoginResponseDTO;
import com.warehouse.server.exceptions.InvalidInputException;
import com.warehouse.server.exceptions.NotFoundException;
import com.warehouse.server.exceptions.UnauthorizedException;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;

public interface AuthController {
    ResponseEntity<LoginResponseDTO> login(HttpServletResponse response,
                                           LoginRequestDTO loginRequestDTO,
                                           BindingResult bindingResult) throws NotFoundException;

    ResponseEntity<String> changePassword(HttpServletResponse response,
                                          ChangePasswordRequestDTO changePasswordRequestDTO,
                                          BindingResult bindingResult) throws InvalidInputException,
            NotFoundException;

    ResponseEntity<Object> logout(String refreshToken);

    ResponseEntity<CurrentUserResponseDTO> getCurrentUser();

    ResponseEntity<LoginResponseDTO> refreshToken(String refreshToken) throws UnauthorizedException;

}
