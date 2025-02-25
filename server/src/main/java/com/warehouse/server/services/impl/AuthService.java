package com.warehouse.server.services.impl;

import com.warehouse.server.dtos.responses.auth.SuccessfulLoginDTO;
import com.warehouse.server.dtos.responses.auth.SuccessfulPasswordChangeDTO;
import com.warehouse.server.dtos.responses.auth.LoginResponseDTO;
import com.warehouse.server.entities.User;
import com.warehouse.server.exceptions.InvalidInputException;
import com.warehouse.server.exceptions.NotFoundException;
import com.warehouse.server.exceptions.UnauthorizedException;
import com.warehouse.server.repositories.RefreshTokenRepository;
import com.warehouse.server.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService implements com.warehouse.server.services.AuthService {

    private final PasswordEncoder        passwordEncoder;
    private final UserDetailsService     userDetailsService;
    private final UserRepository         userRepository;
    private final JwtService             jwtService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${security.jwt.expirationPeriod}")
    private long expirationPeriod;

    @Autowired
    public AuthService(PasswordEncoder passwordEncoder,
                       UserDetailsService userDetailsService,
                       UserRepository userRepository,
                       JwtService jwtService,
                       RefreshTokenRepository refreshTokenRepository) {
        this.passwordEncoder        = passwordEncoder;
        this.userDetailsService     = userDetailsService;
        this.userRepository         = userRepository;
        this.jwtService             = jwtService;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public SuccessfulLoginDTO login(String username, String password) throws NotFoundException {

        var userDetail = userDetailsService.loadUserByUsername(username);

        if (userDetail != null) {
            if (passwordEncoder.matches(password, userDetail.getPassword())) {

                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetail.getUsername(),
                        null,
                        userDetail.getAuthorities());

                SecurityContextHolder.getContext().setAuthentication(authenticationToken);

                var user = userRepository.getUsersByUsername(userDetail.getUsername());

                var accessToken  = jwtService.generateToken(user);
                var refreshToken = jwtService.generateRefreshToken(user);

                return new SuccessfulLoginDTO(accessToken, refreshToken, user);
            }
        }
        throw new NotFoundException("Username and or password is invalid.");
    }

    @Transactional
    public SuccessfulPasswordChangeDTO changePassword(String oldPassword,
                                                      String newPassword,
                                                      String newPasswordConfirm) throws NotFoundException,
            InvalidInputException {
        var auth     = SecurityContextHolder.getContext().getAuthentication();
        var username = auth.getName();
        if (username != null) {
            var user = userRepository.getUsersByUsername(username);
            if (user != null) {
                if (passwordEncoder.matches(oldPassword, user.getPassword())) {


                    user.setPassword(passwordEncoder.encode(newPassword));

                    var refreshToken = jwtService.generateRefreshToken(user);
                    var updated      = userRepository.save(user);

                    // invalid old refresh token
                    refreshTokenRepository.invalidateRefreshTokensByUser(user.getUsername());

                    return new SuccessfulPasswordChangeDTO(refreshToken, updated);
                }
                throw new InvalidInputException("Passwords do not match.");
            }
        }
        throw new NotFoundException("User not found.");
    }

    @Override
    public void logout(String token) {
        var refreshToken = refreshTokenRepository.findRefreshTokenByToken(token).getFirst();
        if (refreshToken != null) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
        }
    }

    @Override
    public User getCurrentUser() {
        var auth      = SecurityContextHolder.getContext().getAuthentication();
        var principal = auth.getName();
        return userRepository.getUsersByUsername(principal);
    }

    @Override
    public LoginResponseDTO refreshToken(String token) throws UnauthorizedException {
        var refreshToken = refreshTokenRepository.findRefreshTokenByToken(token).getFirst();
        if (refreshToken != null) {
            var isValid = jwtService.isRefreshTokenValid(refreshToken);
            if (isValid) {
                var user        = refreshToken.getUser();
                var accessToken = jwtService.generateToken(user);
                return new LoginResponseDTO(accessToken,
                                            expirationPeriod,
                                            user.getUsername(),
                                            user.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList());
            }

        }
        throw new UnauthorizedException();
    }

}
