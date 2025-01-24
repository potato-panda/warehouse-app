package com.warehouse.server.dtos;

import com.warehouse.server.entities.User;

public record SuccessfulLogin(String accessToken, String refreshToken, User user) {
}
