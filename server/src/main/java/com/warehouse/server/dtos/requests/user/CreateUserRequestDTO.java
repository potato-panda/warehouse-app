package com.warehouse.server.dtos.requests.user;

import com.warehouse.server.annotations.FieldsValueMatch;
import jakarta.validation.Valid;
import org.hibernate.validator.constraints.Length;

import java.util.Collection;
import java.util.stream.Collectors;

@FieldsValueMatch.List({
        @FieldsValueMatch(
                message = "Passwords do not match.",
                field = "password",
                fieldMatch = "confirmPassword"
        )
})
public record CreateUserRequestDTO(
        @Length(min = 6, max = 50, message = "Username must be between 6 and 50 characters long.") String username,
        @Length(min = 8, message = "Passwords must be at least 8 characters long.") String password,
        @Length(min = 8) String confirmPassword,
        @Valid Collection<String> authorities) {
    public CreateUserRequestDTO {
        username    = username.trim();
        authorities = authorities.stream()
                                 .distinct()
                                 .collect(Collectors.toList());
    }
}
