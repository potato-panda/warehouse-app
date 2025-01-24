package com.warehouse.server.dtos.requests;

import jakarta.validation.constraints.NotNull;

public record DeleteUserRequest(@NotNull(message = "Username can not be empty.") String username) {
}
