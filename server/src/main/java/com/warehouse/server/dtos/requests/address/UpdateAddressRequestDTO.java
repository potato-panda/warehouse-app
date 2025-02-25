package com.warehouse.server.dtos.requests.address;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateAddressRequestDTO(@NotNull Long id,

                                      @NotNull @Size(min = 2, max = 255) String fullAddress) {}
