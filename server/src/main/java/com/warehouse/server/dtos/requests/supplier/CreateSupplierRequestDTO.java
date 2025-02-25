package com.warehouse.server.dtos.requests.supplier;

import com.warehouse.server.dtos.requests.address.CreateAddressRequestDTO;
import com.warehouse.server.dtos.requests.contact.CreateContactRequestDTO;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateSupplierRequestDTO(@NotNull @Size(min = 2, max = 100) String name,

                                       List<@NotNull CreateAddressRequestDTO> addresses,

                                       List<@NotNull CreateContactRequestDTO> contacts) {
}
