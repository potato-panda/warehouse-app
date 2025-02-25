package com.warehouse.server.controllers;

import com.warehouse.server.dtos.requests.supplier.CreateSupplierRequestDTO;
import com.warehouse.server.dtos.requests.supplier.UpdateSupplierRequestDTO;
import com.warehouse.server.dtos.responses.supplier.SupplierResponseDTO;
import org.springframework.http.ResponseEntity;

public interface SupplierController {
    public ResponseEntity<SupplierResponseDTO> createCustomer(CreateSupplierRequestDTO requestDTO);

    public ResponseEntity<SupplierResponseDTO> updateCustomer(UpdateSupplierRequestDTO requestDTO);
}
