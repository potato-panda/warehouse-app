package com.warehouse.server.dtos.responses;

import java.util.Collection;

public record LoginResponse(String accessToken, Long expiresIn, String username,
                            Collection<String> authorities) {}
