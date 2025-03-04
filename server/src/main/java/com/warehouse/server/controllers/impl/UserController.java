package com.warehouse.server.controllers.impl;

import com.warehouse.server.dtos.requests.user.CreateUserRequestDTO;
import com.warehouse.server.dtos.requests.user.DeleteUserRequestDTO;
import com.warehouse.server.exceptions.InvalidInputException;
import com.warehouse.server.exceptions.NotFoundException;
import com.warehouse.server.services.impl.UserDetailsServiceImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.BasePathAwareController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@BasePathAwareController("/users")
public class UserController {

    private final UserDetailsServiceImpl userDetailsService;

    @Autowired
    public UserController(UserDetailsServiceImpl userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/new")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> createUser(@Valid @RequestBody CreateUserRequestDTO createUserRequestDTO) throws InvalidInputException {
        var newUser = userDetailsService.createUser(createUserRequestDTO);
        if (newUser != null) {
            return ResponseEntity.status(HttpStatus.CREATED)
                                 .body(newUser.getUsername());
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                             .build();
    }

    @PostMapping("/delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@Valid @RequestBody DeleteUserRequestDTO deleteUserRequestDTO) throws InvalidInputException, NotFoundException {
        var success = userDetailsService.deleteUser(deleteUserRequestDTO.username());
        if (success != null) {
            return ResponseEntity.status(HttpStatus.CREATED)
                                 .body(success);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                             .build();
    }

}
