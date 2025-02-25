package com.warehouse.server.controllers.impl;

import com.warehouse.server.controllers.SupplierController;
import com.warehouse.server.dtos.requests.supplier.CreateSupplierRequestDTO;
import com.warehouse.server.dtos.requests.supplier.UpdateSupplierRequestDTO;
import com.warehouse.server.dtos.responses.supplier.SupplierResponseDTO;
import com.warehouse.server.services.SupplierService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.BasePathAwareController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@BasePathAwareController("/suppliers")
public class SupplierControllerImpl implements SupplierController {
    private final SupplierService supplierService;

    @Autowired
    public SupplierControllerImpl(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @Override
    @PostMapping("/create")
    public ResponseEntity<SupplierResponseDTO> createCustomer(@Valid @RequestBody CreateSupplierRequestDTO requestDTO) {
        var response = supplierService.createSupplier(requestDTO);
        return ResponseEntity.ok(response);
    }

    @Override
    @PutMapping("/update")
    public ResponseEntity<SupplierResponseDTO> updateCustomer(@Valid @RequestBody UpdateSupplierRequestDTO requestDTO) {
        var response = supplierService.updateSupplier(requestDTO);
        return ResponseEntity.ok(response);
    }
}
