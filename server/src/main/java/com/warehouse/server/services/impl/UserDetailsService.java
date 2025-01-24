package com.warehouse.server.services.impl;

import com.warehouse.server.dtos.requests.CreateUserRequest;
import com.warehouse.server.entities.Role;
import com.warehouse.server.entities.User;
import com.warehouse.server.exceptions.InvalidInputException;
import com.warehouse.server.exceptions.NotFoundException;
import com.warehouse.server.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.stream.Collectors;

@Service
public class UserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserDetailsService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var entity = userRepository.getUserByUsername(username);

        return org.springframework.security.core.userdetails.User.builder()
                                                                 .username(entity.getUsername())
                                                                 .password(entity.getPassword())
                                                                 .authorities(entity.getAuthorities())
                                                                 .build();
    }

    public Collection<? extends GrantedAuthority> getRoles() {
        return SecurityContextHolder.getContext()
                                    .getAuthentication()
                                    .getAuthorities();
    }

    public User createUser(CreateUserRequest createUserRequest) throws InvalidInputException {
        var username = createUserRequest.username();

        var entity = userRepository.getUserByUsername(username);
        if (entity != null) {
            throw new InvalidInputException("Username is already taken.");
        }

        var newUser = new User(username,
                               passwordEncoder.encode(createUserRequest.password()),
                               createUserRequest.authorities()
                                                .stream()
                                                .map(Role::new)
                                                .collect(Collectors.toList()),
                               true);

        return userRepository.save(newUser);
    }

    public String deleteUser(String username) throws NotFoundException {
        var entity = userRepository.getUserByUsername(username);
        if (entity != null) {
            userRepository.delete(entity);

            return username;
        }
        throw new NotFoundException("User can not be found.");
    }
}