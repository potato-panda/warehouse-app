package com.warehouse.server.services.impl;

import com.warehouse.server.dtos.requests.user.CreateUserRequestDTO;
import com.warehouse.server.entities.Authority;
import com.warehouse.server.entities.User;
import com.warehouse.server.exceptions.InvalidInputException;
import com.warehouse.server.exceptions.NotFoundException;
import com.warehouse.server.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.stream.Collectors;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserDetailsServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var entity = userRepository.getUsersByUsername(username);

        return User.builder()
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

    @Transactional
    public User createUser(CreateUserRequestDTO createUserRequestDTO) throws InvalidInputException {
        var username = createUserRequestDTO.username();

        var entity = userRepository.getUsersByUsername(username);
        if (entity != null) {
            throw new InvalidInputException("Username is already taken.");
        }

        var newUser = new User(username,
                               passwordEncoder.encode(createUserRequestDTO.password()),
                               createUserRequestDTO.authorities()
                                                   .stream()
                                                   .map(Authority::new)
                                                   .collect(Collectors.toList()),
                               true);

        return userRepository.save(newUser);
    }

    @Transactional
    public String deleteUser(String username) throws NotFoundException {
        var entity = userRepository.getUsersByUsername(username);
        if (entity != null) {
            userRepository.delete(entity);

            return username;
        }
        throw new NotFoundException("User can not be found.");
    }
}