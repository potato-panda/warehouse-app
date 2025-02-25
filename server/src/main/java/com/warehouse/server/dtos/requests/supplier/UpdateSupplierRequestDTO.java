package com.warehouse.server.dtos.requests.supplier;

import com.warehouse.server.dtos.requests.address.CreateAddressRequestDTO;
import com.warehouse.server.dtos.requests.address.UpdateAddressRequestDTO;
import com.warehouse.server.dtos.requests.contact.CreateContactRequestDTO;
import com.warehouse.server.dtos.requests.contact.UpdateContactRequestDTO;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateSupplierRequestDTO(@NotNull Long id,

                                       @NotNull @Size(min = 2, max = 100) String name,

                                       List<UpdateAddressRequestDTO> addresses,

                                       List<UpdateContactRequestDTO> contacts) {}
