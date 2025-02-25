package com.warehouse.server.dtos.requests.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateContactRequestDTO(@NotNull Long id,

                                      @NotNull @Size(min = 2, max = 100) String name,

                                      @NotNull @Size(min = 2, max = 20) String phone,

                                      @Email String email) {}
