package com.warehouse.server.services;

import com.warehouse.server.dtos.SuccessfulLogin;
import com.warehouse.server.dtos.SuccessfulPasswordChange;
import com.warehouse.server.dtos.responses.LoginResponse;
import com.warehouse.server.entities.User;
import com.warehouse.server.exceptions.InvalidInputException;
import com.warehouse.server.exceptions.NotFoundException;
import com.warehouse.server.exceptions.UnauthorizedException;

public interface AuthService {
    SuccessfulLogin login(String username, String password) throws InvalidInputException, NotFoundException;

    SuccessfulPasswordChange changePassword(String oldPassword,
                                            String newPassword,
                                            String newPasswordConfirm) throws InvalidInputException, NotFoundException;

    void logout(String token) throws NotFoundException;

    User getCurrentUser();

    LoginResponse refreshToken(String token) throws UnauthorizedException;
}
