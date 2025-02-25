package com.warehouse.server.dtos.responses.auth;

import java.util.Collection;

public record CurrentUserResponseDTO(String username, Collection<String> authorities) {
}
