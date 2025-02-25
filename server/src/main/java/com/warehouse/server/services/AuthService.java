package com.warehouse.server.services;

import com.warehouse.server.dtos.responses.auth.SuccessfulLoginDTO;
import com.warehouse.server.dtos.responses.auth.SuccessfulPasswordChangeDTO;
import com.warehouse.server.dtos.responses.auth.LoginResponseDTO;
import com.warehouse.server.entities.User;
import com.warehouse.server.exceptions.InvalidInputException;
import com.warehouse.server.exceptions.NotFoundException;
import com.warehouse.server.exceptions.UnauthorizedException;

public interface AuthService {
    SuccessfulLoginDTO login(String username, String password) throws InvalidInputException, NotFoundException;

    SuccessfulPasswordChangeDTO changePassword(String oldPassword,
                                               String newPassword,
                                               String newPasswordConfirm) throws InvalidInputException, NotFoundException;

    void logout(String token) throws NotFoundException;

    User getCurrentUser();

    LoginResponseDTO refreshToken(String token) throws UnauthorizedException;
}
