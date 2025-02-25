package com.warehouse.server.controllers;

import com.warehouse.server.dtos.requests.customer.CreateCustomerRequestDTO;
import com.warehouse.server.dtos.requests.customer.UpdateCustomerRequestDTO;
import com.warehouse.server.dtos.responses.customer.CustomerResponseDTO;
import org.springframework.http.ResponseEntity;

public interface CustomerController {
    public ResponseEntity<CustomerResponseDTO> createCustomer(CreateCustomerRequestDTO requestDTO);

    public ResponseEntity<CustomerResponseDTO> updateCustomer(UpdateCustomerRequestDTO requestDTO);
}
