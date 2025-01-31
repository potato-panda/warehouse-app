package com.warehouse.server.services.impl;

import com.warehouse.server.entities.RefreshToken;
import com.warehouse.server.entities.User;
import com.warehouse.server.repositories.RefreshTokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class JwtService implements com.warehouse.server.services.JwtService {

    private final RefreshTokenRepository refreshTokenRepository;
    private       SecretKey              secretKey;

    @Value("${security.jwt.secret}")
    private       String                 secret;

    @Value("${security.jwt.expirationPeriod}")
    private       long                   expirationPeriod;

    @Value("${security.jwt.refreshPeriod}")
    private       long                   refreshExpirationPeriod;

    @Value("${security.jwt.issuer}")
    private       String                 issuer;

    @Autowired
    public JwtService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @PostConstruct
    private void init() {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    @Override
    public String generateToken(User user) {
        Map<String, String> claims = new HashMap<>();
        claims.put("authorities",
                   user.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.joining(",")));

        var localDateTime = LocalDateTime.now();

        return Jwts.builder()
                   .subject(user.getUsername())
                   .claims(claims)
                   .issuer(issuer)
                   .issuedAt(new Date(localDateTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()))
                   .expiration(new Date(localDateTime.plusSeconds(expirationPeriod)
                                                     .atZone(ZoneId.systemDefault())
                                                     .toInstant()
                                                     .toEpochMilli()))
                   .signWith(secretKey)
                   .compact();
    }

    @Override
    public String getUsernameFromToken(String token) {
        return getClaimsFromToken(token).getSubject();
    }

    @Override
    public Boolean isTokenValid(String token, UserDetails user) {
        var claims = getClaimsFromToken(token);
        return !isTokenExpired(claims);
    }

    @Override
    public Boolean isTokenValid(Claims claims, UserDetails user) {
        return claims.getSubject().equals(user.getUsername()) && Objects.equals(claims.getIssuer(),
                                                                                issuer) && !isTokenExpired(claims);
    }

    public Boolean isTokenExpired(Claims claims) {
        return new Date(Instant.now().toEpochMilli()).after(claims.getExpiration());
    }

    @Override
    public Claims getClaimsFromToken(String token) {
        var parser = Jwts.parser().verifyWith(secretKey).build();
        return parser.parseSignedClaims(token).getPayload();
    }

    @Override
    @Transactional
    public String generateRefreshToken(User user) {
        var localDateTime = LocalDateTime.now();
        var token = Jwts.builder()
                        .subject(user.getUsername())
                        .issuer(issuer)
                        .issuedAt(new Date(localDateTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()))
                        .expiration(new Date(localDateTime.plusSeconds(refreshExpirationPeriod)
                                                          .atZone(ZoneId.systemDefault())
                                                          .toInstant()
                                                          .toEpochMilli()))
                        .signWith(secretKey)
                        .compact();
        var refreshToken = new RefreshToken(false, null, user, token, localDateTime);
        refreshTokenRepository.save(refreshToken);
        return token;
    }

    @Override
    public RefreshToken getRefreshToken(String token) {
        return refreshTokenRepository.findRefreshTokenByToken(token).getFirst();
    }


    @Override
    public Boolean isRefreshTokenValid(RefreshToken refreshToken) {
        var now     = LocalDateTime.now();
        var expires = refreshToken.getExpiryDate();
        return now.isBefore(expires) && !refreshToken.getRevoked();
    }

    @Override
    @Transactional
    public void deleteRefreshToken(RefreshToken token) {
        token.setRevoked(true);
        refreshTokenRepository.save(token);
    }
}
