package com.warehouse.server.services;

import com.warehouse.server.dtos.requests.customer.CreateCustomerRequestDTO;
import com.warehouse.server.dtos.requests.customer.UpdateCustomerRequestDTO;
import com.warehouse.server.dtos.responses.customer.CustomerResponseDTO;

public interface CustomerService {
    CustomerResponseDTO createCustomer(CreateCustomerRequestDTO requestDTO);

    CustomerResponseDTO updateCustomer(UpdateCustomerRequestDTO requestDTO);
}
