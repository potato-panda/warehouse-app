package com.warehouse.server.dtos.requests.user;

import jakarta.validation.constraints.NotNull;

public record DeleteUserRequestDTO(@NotNull(message = "Username can not be empty.") String username) {
}
