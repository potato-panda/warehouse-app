package com.warehouse.server.dtos.requests;

import jakarta.validation.constraints.NotNull;

public record LoginRequest(@NotNull(message = "Username can not be empty.") String username,
                           @NotNull(message = "Password can not be empty.") String password) {}
