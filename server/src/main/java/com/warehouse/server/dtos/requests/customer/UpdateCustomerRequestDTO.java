package com.warehouse.server.dtos.requests.customer;

import com.warehouse.server.dtos.requests.address.UpdateAddressRequestDTO;
import com.warehouse.server.dtos.requests.contact.UpdateContactRequestDTO;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateCustomerRequestDTO(@NotNull Long id,

                                       @NotNull @Size(min = 2, max = 100) String name,

                                       @Size(min = 2, max = 255) String billingAddress,

                                       String website,

                                       String tin,

                                       List<@NotNull UpdateAddressRequestDTO> shippingAddresses,

                                       List<@NotNull UpdateContactRequestDTO> contacts) {}
