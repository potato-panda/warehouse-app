package com.warehouse.server.dtos.responses.supplier;

import com.warehouse.server.entities.Address;
import com.warehouse.server.entities.Contact;

import java.util.List;

public record SupplierResponseDTO(Long id, String name, List<Address> addresses, List<Contact> contacts) {}
