package com.warehouse.server.dtos.responses.auth;

import com.warehouse.server.entities.User;

public record SuccessfulLoginDTO(String accessToken, String refreshToken, User user) {
}
