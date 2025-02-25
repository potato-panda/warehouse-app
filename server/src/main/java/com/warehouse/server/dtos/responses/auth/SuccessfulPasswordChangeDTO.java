package com.warehouse.server.dtos.responses.auth;

import com.warehouse.server.entities.User;

public record SuccessfulPasswordChangeDTO(String refreshToken, User user) {
}
