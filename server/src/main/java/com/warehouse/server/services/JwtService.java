package com.warehouse.server.services;

import com.warehouse.server.entities.RefreshToken;
import com.warehouse.server.entities.User;
import io.jsonwebtoken.Claims;
import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {
    String generateToken(User user);

    String getUsernameFromToken(String token);

    Boolean isTokenValid(String token, UserDetails user);

    Boolean isTokenValid(Claims claims, UserDetails user);

    Claims getClaimsFromToken(String token);

    String generateRefreshToken(User user);

    RefreshToken getRefreshToken(String token);

    Boolean isRefreshTokenValid(RefreshToken refreshToken);

    void deleteRefreshToken(RefreshToken token);
}
