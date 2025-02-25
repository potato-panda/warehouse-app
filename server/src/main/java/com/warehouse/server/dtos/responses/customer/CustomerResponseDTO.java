package com.warehouse.server.dtos.responses.customer;

import com.warehouse.server.entities.Address;
import com.warehouse.server.entities.Contact;
import com.warehouse.server.entities.Quotation;

import java.util.List;

public record CustomerResponseDTO(Long id, String name, String billingAddress, List<Address> shippingAddresses,
                                  List<Contact> contacts, String website, String tin, List<Quotation> quotations) {}
