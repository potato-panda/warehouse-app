package com.warehouse.server.repositories;

import com.warehouse.server.entities.Address;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

@RepositoryRestResource(collectionResourceRel = "addresses", path = "addresses")
public interface AddressRepository extends JpaRepository<Address, Long> {

    @RestResource(path = "byCustomerId", rel = "byCustomerId")
    Page<Address> findAllByCustomer_Id(Long customerId, Pageable pageable);

    @RestResource(path = "byCustomerIdAndAddressName", rel = "byCustomerIdAndAddressName")
    Page<Address> findAllByFullAddressAndCustomer_Id(String fullAddress, Long customerId, Pageable pageable);
}
