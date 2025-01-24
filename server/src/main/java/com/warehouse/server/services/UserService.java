package com.warehouse.server.services;

import com.warehouse.server.dtos.requests.CreateUserRequest;
import com.warehouse.server.entities.User;
import com.warehouse.server.exceptions.InvalidInputException;
import com.warehouse.server.exceptions.NotFoundException;

public interface UserService {
    User createUser(CreateUserRequest createUserRequest) throws InvalidInputException;

    String deleteUser(String username) throws NotFoundException;
}
