package com.warehouse.server.dtos.responses.auth;

import java.util.Collection;

public record LoginResponseDTO(String accessToken, Long expiresIn, String username,
                               Collection<String> authorities) {}
