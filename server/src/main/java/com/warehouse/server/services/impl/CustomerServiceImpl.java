package com.warehouse.server.services.impl;

import com.warehouse.server.dtos.requests.customer.CreateCustomerRequestDTO;
import com.warehouse.server.dtos.requests.customer.UpdateCustomerRequestDTO;
import com.warehouse.server.dtos.responses.customer.CustomerResponseDTO;
import com.warehouse.server.entities.Address;
import com.warehouse.server.entities.Contact;
import com.warehouse.server.entities.Customer;
import com.warehouse.server.repositories.CustomerRepository;
import com.warehouse.server.services.CustomerService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Autowired
    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    @Transactional
    public CustomerResponseDTO createCustomer(CreateCustomerRequestDTO requestDTO) {
        var dtoContacts          = requestDTO.contacts();
        var dtoShippingAddresses = requestDTO.shippingAddresses();
        var customer             = new Customer();
        customer.setName(requestDTO.name());
        customer.setBillingAddress(requestDTO.billingAddress());
        customer.setWebsite(requestDTO.website());
        customer.setTin(requestDTO.tin());

        // Add contacts
        var contacts = dtoContacts.stream().map(dto -> {
            var contact = new Contact();
            contact.setName(dto.name());
            contact.setPhone(dto.phone());
            contact.setEmail(dto.email());
            contact.setCustomer(customer);
            return contact;
        }).collect(Collectors.toList());
        customer.setContacts(contacts);

        // Add shipping addresses
        var shippingAddresses = dtoShippingAddresses.stream().map(dto -> {
            var address = new Address();
            address.setFullAddress(dto.fullAddress());
            address.setCustomer(customer);
            return address;
        }).collect(Collectors.toList());
        customer.setShippingAddresses(shippingAddresses);

        var saved = customerRepository.save(customer);

        return new CustomerResponseDTO(
                saved.getId(),
                saved.getName(),
                saved.getBillingAddress(),
                saved.getShippingAddresses(),
                saved.getContacts(),
                saved.getWebsite(),
                saved.getTin(),
                saved.getQuotations()
        );
    }

    @Override
    @Transactional
    public CustomerResponseDTO updateCustomer(UpdateCustomerRequestDTO requestDTO) {
        var customer = customerRepository.findById(requestDTO.id())
                                         .orElseThrow(() -> new EntityNotFoundException("Customer not found"));

        customer.setName(requestDTO.name());
        customer.setBillingAddress(requestDTO.billingAddress());
        customer.setWebsite(requestDTO.website());
        customer.setTin(requestDTO.tin());

        // Update contacts
        var existingContacts = customer.getContacts().stream()
                                       .collect(Collectors.toMap(Contact::getId, Function.identity()));
        customer.getContacts().addAll(requestDTO.contacts().stream().map(dto -> {
            Contact contact = existingContacts.getOrDefault(dto.id(), new Contact());
            contact.setId(dto.id());
            contact.setName(dto.name());
            contact.setPhone(dto.phone());
            contact.setEmail(dto.email());
            contact.setCustomer(customer);
            return contact;
        }).collect(Collectors.toSet()));

        // Update shipping addresses
        var existingAddresses = customer.getShippingAddresses().stream()
                                        .collect(Collectors.toMap(Address::getId, Function.identity()));
        customer.getShippingAddresses().addAll(requestDTO.shippingAddresses().stream().map(dto -> {
            Address address = existingAddresses.getOrDefault(dto.id(), new Address());
            address.setId(dto.id());
            address.setFullAddress(dto.fullAddress());
            address.setCustomer(customer);
            return address;
        }).collect(Collectors.toSet()));

        var saved = customerRepository.save(customer);

        return new CustomerResponseDTO(
                saved.getId(),
                saved.getName(),
                saved.getBillingAddress(),
                new ArrayList<>(saved.getShippingAddresses()),
                new ArrayList<>(saved.getContacts()),
                saved.getWebsite(),
                saved.getTin(),
                null
        );
    }
}
