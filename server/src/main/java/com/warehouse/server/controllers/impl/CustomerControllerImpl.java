package com.warehouse.server.controllers.impl;

import com.warehouse.server.controllers.CustomerController;
import com.warehouse.server.dtos.requests.customer.CreateCustomerRequestDTO;
import com.warehouse.server.dtos.requests.customer.UpdateCustomerRequestDTO;
import com.warehouse.server.dtos.responses.customer.CustomerResponseDTO;
import com.warehouse.server.services.CustomerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.BasePathAwareController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@BasePathAwareController("/customers")
public class CustomerControllerImpl implements CustomerController {
    private final CustomerService customerService;

    @Autowired
    public CustomerControllerImpl(CustomerService customerService) {
        this.customerService = customerService;
    }

    @Override
    @PostMapping("/create")
    public ResponseEntity<CustomerResponseDTO> createCustomer(@Valid @RequestBody CreateCustomerRequestDTO requestDTO) {
        var response = customerService.createCustomer(requestDTO);
        return ResponseEntity.ok().body(response);
    }

    @Override
    @PutMapping("/update")
    public ResponseEntity<CustomerResponseDTO> updateCustomer(@Valid @RequestBody UpdateCustomerRequestDTO requestDTO) {
        var response = customerService.updateCustomer(requestDTO);
        return ResponseEntity.ok().body(response);
    }
}
