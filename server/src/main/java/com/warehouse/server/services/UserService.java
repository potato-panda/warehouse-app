package com.warehouse.server.services;

import com.warehouse.server.dtos.requests.user.CreateUserRequestDTO;
import com.warehouse.server.entities.User;
import com.warehouse.server.exceptions.InvalidInputException;
import com.warehouse.server.exceptions.NotFoundException;

public interface UserService {
    User createUser(CreateUserRequestDTO createUserRequestDTO) throws InvalidInputException;

    User createUser(User user) throws InvalidInputException;

    String deleteUser(String username) throws NotFoundException;
}
