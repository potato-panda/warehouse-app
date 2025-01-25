package com.warehouse.server.dtos.responses;

import java.util.Collection;

public record CurrentUserResponse(String username, Collection<String> authorities) {
}
