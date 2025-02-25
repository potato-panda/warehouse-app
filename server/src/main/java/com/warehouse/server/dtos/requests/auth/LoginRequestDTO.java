package com.warehouse.server.dtos.requests.auth;

import jakarta.validation.constraints.NotNull;

public record LoginRequestDTO(@NotNull(message = "Username can not be empty.") String username,
                              @NotNull(message = "Password can not be empty.") String password) {}
