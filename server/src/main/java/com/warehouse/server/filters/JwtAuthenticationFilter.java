package com.warehouse.server.filters;

import com.warehouse.server.services.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String             AUTHORIZATION_HEADER = "Authorization";
    private final        JwtService         jwtService;
    private final        UserDetailsService userDetailsService;

    @Autowired
    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService         = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        var auth = request.getHeader(AUTHORIZATION_HEADER);

        if (auth != null && auth.startsWith("Bearer ")) {
            auth = auth.substring(7);

            var username = jwtService.getUsernameFromToken(auth);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() != null) {
                var entity = userDetailsService.loadUserByUsername(username);
                if (jwtService.isTokenValid(auth, entity)) {
                    var authentication = new UsernamePasswordAuthenticationToken(entity.getUsername(),
                                                                                 null,
                                                                                 entity.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    authentication.setAuthenticated(true);

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
