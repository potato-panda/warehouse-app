package com.warehouse.server.services.impl;

import com.warehouse.server.dtos.requests.supplier.CreateSupplierRequestDTO;
import com.warehouse.server.dtos.requests.supplier.UpdateSupplierRequestDTO;
import com.warehouse.server.dtos.responses.supplier.SupplierResponseDTO;
import com.warehouse.server.entities.Address;
import com.warehouse.server.entities.Contact;
import com.warehouse.server.entities.Supplier;
import com.warehouse.server.repositories.SupplierRepository;
import com.warehouse.server.services.SupplierService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    @Autowired
    public SupplierServiceImpl(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    @Override
    @Transactional
    public SupplierResponseDTO createSupplier(CreateSupplierRequestDTO requestDTO) {
        var dtoContacts  = requestDTO.contacts();
        var dtoAddresses = requestDTO.addresses();
        var supplier     = new Supplier();
        supplier.setName(requestDTO.name());

        // Add contacts
        var contacts = dtoContacts.stream().map(dto -> {
            var contact = new Contact();
            contact.setName(dto.name());
            contact.setEmail(dto.email());
            contact.setPhone(dto.phone());
            contact.setSupplier(supplier);
            return contact;
        }).toList();
        supplier.setContacts(contacts);

        // Add addresses
        var addresses = dtoAddresses.stream().map(dto -> {
            var address = new Address();
            address.setFullAddress(dto.fullAddress());
            address.setSupplier(supplier);
            return address;
        }).toList();
        supplier.setAddresses(addresses);

        var saved = supplierRepository.save(supplier);

        return new SupplierResponseDTO(
                saved.getId(),
                saved.getName(),
                saved.getAddresses(),
                saved.getContacts()
        );
    }

    @Override
    @Transactional
    public SupplierResponseDTO updateSupplier(UpdateSupplierRequestDTO requestDTO) {
        var supplier = supplierRepository.findById(requestDTO.id())
                                         .orElseThrow(() -> new EntityNotFoundException("Supplier not found"));
        supplier.setName(requestDTO.name());

        // Update contacts
        var existingContacts = supplier.getContacts()
                                       .stream()
                                       .collect(Collectors.toMap(Contact::getId, Function.identity()));
        supplier.getContacts().addAll(requestDTO.contacts().stream().map(dto -> {
            var contact = existingContacts.getOrDefault(dto.id(), new Contact());
            contact.setName(dto.name());
            contact.setEmail(dto.email());
            contact.setPhone(dto.phone());
            contact.setSupplier(supplier);
            return contact;
        }).collect(Collectors.toSet()));

        // Update addresses
        var existingAddresses = supplier.getAddresses()
                                        .stream()
                                        .collect(Collectors.toMap(Address::getId, Function.identity()));
        supplier.getAddresses().addAll(requestDTO.addresses().stream().map(dto -> {
            var address = existingAddresses.getOrDefault(dto.id(), new Address());
            address.setFullAddress(dto.fullAddress());
            address.setSupplier(supplier);
            return address;
        }).collect(Collectors.toSet()));

        var saved = supplierRepository.save(supplier);

        return new SupplierResponseDTO(
                saved.getId(), saved.getName(), saved.getAddresses(), saved.getContacts()
        );
    }
}
