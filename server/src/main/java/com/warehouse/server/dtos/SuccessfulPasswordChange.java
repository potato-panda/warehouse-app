package com.warehouse.server.dtos;

import com.warehouse.server.entities.User;

public record SuccessfulPasswordChange(String refreshToken, User user) {
}
