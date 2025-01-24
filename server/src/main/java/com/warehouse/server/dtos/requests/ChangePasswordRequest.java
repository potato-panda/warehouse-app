package com.warehouse.server.dtos.requests;

import com.warehouse.server.annotations.FieldsValueMatch;
import jakarta.validation.constraints.NotNull;

@FieldsValueMatch.List({
        @FieldsValueMatch(
                message = "Passwords do not match.",
                field = "password",
                fieldMatch = "confirmPassword"
        )
})
public record ChangePasswordRequest(
        @NotNull(message = "Old Password can not be empty.") String oldPassword,
        @NotNull(message = "New Password can not be empty.") String password,
        @NotNull(message = "Password Confirmation can not be empty.") String confirmPassword) {
}
