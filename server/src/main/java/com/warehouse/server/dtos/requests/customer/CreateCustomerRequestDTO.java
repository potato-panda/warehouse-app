package com.warehouse.server.dtos.requests.customer;

import com.warehouse.server.dtos.requests.address.CreateAddressRequestDTO;
import com.warehouse.server.dtos.requests.contact.CreateContactRequestDTO;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateCustomerRequestDTO(@NotNull @Size(min = 2, max = 100) String name,

                                       @Size(min = 2, max = 255) String billingAddress,

                                       String website,

                                       String tin,

                                       List<@NotNull CreateAddressRequestDTO> shippingAddresses,

                                       List<@NotNull CreateContactRequestDTO> contacts) {}
