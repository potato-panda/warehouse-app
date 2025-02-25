package com.warehouse.server.services;

import com.warehouse.server.dtos.requests.supplier.CreateSupplierRequestDTO;
import com.warehouse.server.dtos.requests.supplier.UpdateSupplierRequestDTO;
import com.warehouse.server.dtos.responses.supplier.SupplierResponseDTO;

public interface SupplierService {
    SupplierResponseDTO createSupplier(CreateSupplierRequestDTO requestDTO);

    SupplierResponseDTO updateSupplier(UpdateSupplierRequestDTO requestDTO);
}
